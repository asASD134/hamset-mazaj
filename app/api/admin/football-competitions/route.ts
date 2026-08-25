import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BSD_BASE_URL =
  "https://sports.bzzoiro.com/api/v2";

const TABLE = "football_competitions";

type BsdLeague = {
  id?: number;
  name?: string;
  country?: string | null;
};

type BsdLeaguesResponse = {
  count?: number;
  next?: string | null;
  results?: BsdLeague[];
  detail?: string;
  error?: string;
  message?: string;
};

type CompetitionUpdate = {
  id: number;
  is_active: boolean;
  sort_order: number;
  match_limit: number;
  name_ar?: string | null;
};

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
            // لا شيء
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

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

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

function classifyCompetition(
  name: string
) {
  const value =
    name.toLowerCase();

  const cupWords = [
    "cup",
    "copa",
    "coppa",
    "coupe",
    "pokal",
    "puchar",
    "super cup",
    "champions league",
    "conference league",
    "europa league",
    "nations league",
    "libertadores",
    "sudamericana",
    "afc champions",
    "afc asian",
    "world cup",
    "club world cup",
    "arab cup",
    "gold cup",
    "africa cup",
    "asian cup",
  ];

  return cupWords.some(
    (word) =>
      value.includes(word)
  )
    ? "cup"
    : "league";
}

function mapBsdLeague(
  league: BsdLeague,
  old?: {
    name_ar?: string | null;
    is_active?: boolean;
    sort_order?: number;
    match_limit?: number;
  },
  fallbackOrder = 1000
) {
  const id = Number(league.id);

  return {
    id,
    name: String(
      league.name ?? ""
    ).trim(),
    name_ar:
      old?.name_ar ?? null,
    country:
      league.country ?? null,
    competition_type:
      classifyCompetition(
        String(
          league.name ?? ""
        )
      ),
    logo_url:
      `https://sports.bzzoiro.com/img/league/${id}/?bg=transparent`,
    is_active:
      old?.is_active ?? false,
    sort_order:
      typeof old?.sort_order ===
      "number"
        ? old.sort_order
        : fallbackOrder,
    match_limit:
      typeof old?.match_limit ===
      "number"
        ? old.match_limit
        : 4,
    provider_updated_at:
      new Date().toISOString(),
  };
}

async function fetchBsdLeagues(
  token: string
) {
  const all: BsdLeague[] = [];
  let offset = 0;

  for (
    let page = 0;
    page < 100;
    page += 1
  ) {
    const params =
      new URLSearchParams({
        include_inactive: "true",
        limit: "200",
        offset: String(offset),
      });

    const response = await fetch(
      `${BSD_BASE_URL}/leagues/?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept:
            "application/json",
          Authorization:
            `Token ${token}`,
        },
        cache: "no-store",
      }
    );

    const body =
      (await response.json()) as BsdLeaguesResponse;

    if (!response.ok) {
      throw new Error(
        body.detail ||
          body.error ||
          body.message ||
          `BSD request failed (${response.status})`
      );
    }

    const results =
      body.results ?? [];

    all.push(...results);

    if (
      results.length === 0 ||
      !body.next ||
      (body.count != null &&
        all.length >= body.count)
    ) {
      break;
    }

    offset +=
      results.length;
  }

  return all.filter(
    (league) =>
      Number(
        league.id ?? 0
      ) > 0 &&
      typeof league.name ===
        "string" &&
      league.name.trim() !== ""
  );
}

export async function GET() {
  try {
    const supabase =
      await getAdminSupabase();

    const { data, error } =
      await supabase
        .from(TABLE)
        .select("*")
        .order("sort_order", {
          ascending: true,
        })
        .order("name", {
          ascending: true,
        });

    if (error) {
      console.error(
        "Load competitions error:",
        error
      );

      return jsonError(
        "تعذر تحميل المسابقات.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      competitions:
        data ?? [],
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
      message ===
      "NOT_ADMIN"
    ) {
      return jsonError(
        "ليس لديك صلاحية إدارة المسابقات.",
        403
      );
    }

    return jsonError(
      "تعذر تحميل المسابقات.",
      500
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const supabase =
      await getAdminSupabase();

    const token =
      process.env.BSD_API_KEY?.trim();

    if (!token) {
      return jsonError(
        "BSD_API_KEY غير موجود في .env.local.",
        500
      );
    }

    const body =
      (await request
        .json()
        .catch(() => ({}))) as {
          action?:
            | "discover"
            | "add";
          league_id?: number;
        };

    if (
      body.action ===
      "discover"
    ) {
      const leagues =
        await fetchBsdLeagues(
          token
        );

      const mapped =
        leagues.map(
          (league, index) =>
            mapBsdLeague(
              league,
              undefined,
              (index + 1) * 10
            )
        );

      return NextResponse.json({
        ok: true,
        competitions: mapped,
      });
    }

    if (
      body.action ===
      "add"
    ) {
      const leagueId =
        Number(
          body.league_id
        );

      if (
        !Number.isInteger(
          leagueId
        ) ||
        leagueId <= 0
      ) {
        return jsonError(
          "معرّف البطولة غير صحيح.",
          400
        );
      }

      const leagues =
        await fetchBsdLeagues(
          token
        );

      const league =
        leagues.find(
          (item) =>
            Number(item.id) ===
            leagueId
        );

      if (!league) {
        return jsonError(
          "البطولة غير موجودة لدى مزود البيانات.",
          404
        );
      }

      const {
        data: existing,
        error:
          existingError,
      } = await supabase
        .from(TABLE)
        .select(
          "id,name_ar,is_active,sort_order,match_limit"
        )
        .eq("id", leagueId)
        .maybeSingle();

      if (existingError) {
        console.error(
          existingError
        );

        return jsonError(
          "تعذر قراءة إعدادات البطولة.",
          500
        );
      }

      const row =
        mapBsdLeague(
          league,
          existing ??
            undefined,
          1000
        );

      const {
        data,
        error,
      } = await supabase
        .from(TABLE)
        .upsert(
          row,
          {
            onConflict:
              "id",
          }
        )
        .select("*")
        .single();

      if (error) {
        console.error(
          "Add competition error:",
          error
        );

        return jsonError(
          "تعذر إضافة البطولة.",
          500
        );
      }

      revalidatePath("/");
      revalidatePath(
        "/matches"
      );
      revalidatePath(
        "/admin/football-competitions"
      );

      return NextResponse.json({
        ok: true,
        competitions: [
          data,
        ],
      });
    }

    return jsonError(
      "عملية غير معروفة.",
      400
    );
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
      message ===
      "NOT_ADMIN"
    ) {
      return jsonError(
        "ليس لديك صلاحية إدارة المسابقات.",
        403
      );
    }

    console.error(
      "Football competitions POST error:",
      error
    );

    return jsonError(
      "تعذر تنفيذ العملية.",
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

    const body =
      (await request.json()) as {
        items?: CompetitionUpdate[];
      };

    const items =
      Array.isArray(
        body.items
      )
        ? body.items
        : [];

    if (
      items.length === 0
    ) {
      return jsonError(
        "لم يتم إرسال أي تغييرات.",
        400
      );
    }

    for (const item of items) {
      if (
        !Number.isInteger(
          item.id
        ) ||
        item.id <= 0 ||
        typeof item.is_active !==
          "boolean" ||
        !Number.isInteger(
          item.sort_order
        ) ||
        item.sort_order < 0 ||
        !Number.isInteger(
          item.match_limit
        ) ||
        item.match_limit < 1 ||
        item.match_limit > 20
      ) {
        return jsonError(
          "بيانات إحدى المسابقات غير صحيحة.",
          400
        );
      }
    }

    for (const item of items) {
      const payload: Record<
        string,
        unknown
      > = {
        is_active:
          item.is_active,
        sort_order:
          item.sort_order,
        match_limit:
          item.match_limit,
      };

      if (
        Object.prototype.hasOwnProperty.call(
          item,
          "name_ar"
        )
      ) {
        payload.name_ar =
          typeof item.name_ar ===
          "string"
            ? item.name_ar
                .trim()
                .slice(
                  0,
                  120
                ) || null
            : null;
      }

      const { error } =
        await supabase
          .from(TABLE)
          .update(payload)
          .eq(
            "id",
            item.id
          );

      if (error) {
        console.error(
          "Update competition error:",
          error
        );

        return jsonError(
          "تعذر حفظ إعدادات إحدى المسابقات.",
          500
        );
      }
    }

    revalidatePath("/");
    revalidatePath(
      "/matches"
    );
    revalidatePath(
      "/admin/football-competitions"
    );

    const {
      data,
      error,
    } = await supabase
      .from(TABLE)
      .select("*")
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

    if (error) {
      return jsonError(
        "تم الحفظ لكن تعذر إعادة تحميل القائمة.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      competitions:
        data ?? [],
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
      message ===
      "NOT_ADMIN"
    ) {
      return jsonError(
        "ليس لديك صلاحية إدارة المسابقات.",
        403
      );
    }

    return jsonError(
      "تعذر حفظ إعدادات المسابقات.",
      500
    );
  }
}