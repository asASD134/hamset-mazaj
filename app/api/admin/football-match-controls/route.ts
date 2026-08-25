import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const TABLE = "football_match_controls";

type MatchControlPayload = {
  match_id: number;
  competition_id?: number | null;
  home_team_id?: number | null;
  away_team_id?: number | null;
  kickoff_at?: string | null;
  home_name?: string | null;
  away_name?: string | null;
  competition_name?: string | null;
  is_visible: boolean;
};

async function getAdminSupabase() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(
                  name,
                  value,
                  options
                );
              }
            );
          } catch {
            // تجاهل خطأ كتابة الكوكيز
          }
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("AUTH_REQUIRED");
  }

  const {
    data: isAdmin,
    error: adminError,
  } = await supabase.rpc("is_admin");

  if (adminError) {
    console.error(
      "is_admin RPC error:",
      adminError
    );

    throw new Error(
      "ADMIN_LOOKUP_FAILED"
    );
  }

  if (!isAdmin) {
    throw new Error("NOT_ADMIN");
  }

  return supabase;
}

function jsonError(
  message: string,
  status = 500
) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status }
  );
}

function normalizeMatchControl(
  body: unknown
) {
  if (
    !body ||
    typeof body !== "object"
  ) {
    throw new Error("INVALID_BODY");
  }

  const value =
    body as Record<
      string,
      unknown
    >;

  const matchId = Number(
    value.match_id
  );

  if (
    !Number.isInteger(matchId) ||
    matchId <= 0
  ) {
    throw new Error(
      "INVALID_MATCH_ID"
    );
  }

  if (
    typeof value.is_visible !==
    "boolean"
  ) {
    throw new Error(
      "INVALID_VISIBILITY"
    );
  }

  const toNullableNumber = (
    input: unknown
  ) => {
    if (
      input == null ||
      input === ""
    ) {
      return null;
    }

    const number = Number(input);

    return Number.isFinite(number)
      ? number
      : null;
  };

  const toNullableString = (
    input: unknown
  ) => {
    if (
      input == null ||
      input === ""
    ) {
      return null;
    }

    return (
      String(input).trim() ||
      null
    );
  };

  return {
    match_id: matchId,

    competition_id:
      toNullableNumber(
        value.competition_id
      ),

    home_team_id:
      toNullableNumber(
        value.home_team_id
      ),

    away_team_id:
      toNullableNumber(
        value.away_team_id
      ),

    kickoff_at:
      toNullableString(
        value.kickoff_at
      ),

    home_name:
      toNullableString(
        value.home_name
      ),

    away_name:
      toNullableString(
        value.away_name
      ),

    competition_name:
      toNullableString(
        value.competition_name
      ),

    is_visible:
      value.is_visible,

    updated_at:
      new Date().toISOString(),
  } satisfies MatchControlPayload & {
    updated_at: string;
  };
}

export async function GET() {
  try {
    const supabase =
      await getAdminSupabase();

    const {
      data,
      error,
    } = await supabase
      .from(TABLE)
      .select(
        [
          "match_id",
          "competition_id",
          "home_team_id",
          "away_team_id",
          "kickoff_at",
          "home_name",
          "away_name",
          "competition_name",
          "is_visible",
          "updated_at",
        ].join(",")
      )
      .order(
        "kickoff_at",
        {
          ascending: true,
          nullsFirst: false,
        }
      );

    if (error) {
      console.error(
        "Load football match controls error:",
        error
      );

      return jsonError(
        "تعذر تحميل إعدادات ظهور المباريات.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      controls: data ?? [],
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message ===
      "AUTH_REQUIRED"
    ) {
      return jsonError(
        "يجب تسجيل الدخول أولاً.",
        401
      );
    }

    if (
      message === "NOT_ADMIN"
    ) {
      return jsonError(
        "ليس لديك صلاحية إدارة المباريات.",
        403
      );
    }

    return jsonError(
      "تعذر تحميل إعدادات ظهور المباريات.",
      500
    );
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const supabase =
      await getAdminSupabase();

    const rawBody =
      await request
        .json()
        .catch(() => null);

    let payload: ReturnType<
      typeof normalizeMatchControl
    >;

    try {
      payload =
        normalizeMatchControl(
          rawBody
        );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "";

      if (
        message ===
        "INVALID_MATCH_ID"
      ) {
        return jsonError(
          "معرّف المباراة غير صحيح.",
          400
        );
      }

      if (
        message ===
        "INVALID_VISIBILITY"
      ) {
        return jsonError(
          "قيمة إظهار/إخفاء المباراة غير صحيحة.",
          400
        );
      }

      return jsonError(
        "بيانات المباراة غير صحيحة.",
        400
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from(TABLE)
      .upsert(payload, {
        onConflict:
          "match_id",
      })
      .select("*")
      .single();

    if (error) {
      console.error(
        "Save football match control error:",
        error
      );

      return jsonError(
        "تعذر حفظ حالة المباراة.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      control: data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message ===
      "AUTH_REQUIRED"
    ) {
      return jsonError(
        "يجب تسجيل الدخول أولاً.",
        401
      );
    }

    if (
      message === "NOT_ADMIN"
    ) {
      return jsonError(
        "ليس لديك صلاحية إدارة المباريات.",
        403
      );
    }

    return jsonError(
      "تعذر حفظ إعدادات المباراة.",
      500
    );
  }
}