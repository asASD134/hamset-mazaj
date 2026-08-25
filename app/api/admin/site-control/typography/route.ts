import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getActiveCafeServer } from "@/lib/cafe-context-server";

const TYPOGRAPHY_KEYS = [
  "navbar_site_name",
  "navbar_links",
  "hero_title",
  "hero_subtitle",
  "hero_description",
  "featured_title",
  "featured_description",
  "featured_product_name",
  "featured_price",
  "why_title",
  "why_description",
  "gallery_title",
  "gallery_description",
  "testimonials_title",
  "testimonials_description",
  "contact_title",
  "contact_description",
  "contact_text",
  "footer_text",
] as const;

type TypographySize = {
  desktop: number;
  mobile: number;
};

type SiteTypography = Record<
  (typeof TYPOGRAPHY_KEYS)[number],
  TypographySize
>;

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status }
  );
}

function isValidTypography(
  value: unknown
): value is SiteTypography {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const record = value as Record<
    string,
    unknown
  >;

  for (const key of TYPOGRAPHY_KEYS) {
    const item = record[key];

    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      return false;
    }

    const size = item as Record<
      string,
      unknown
    >;

    const desktop = size.desktop;
    const mobile = size.mobile;

    if (
      typeof desktop !== "number" ||
      typeof mobile !== "number" ||
      !Number.isFinite(desktop) ||
      !Number.isFinite(mobile) ||
      desktop < 8 ||
      desktop > 120 ||
      mobile < 8 ||
      mobile > 120
    ) {
      return false;
    }
  }

  return true;
}

export async function POST(request: Request) {
  try {
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
              // لا نفشل الطلب بسبب تعذر كتابة الكوكيز
              // في سياق لا يسمح بالكتابة.
            }
          },
        },
      }
    );

    /* =========================================
       التحقق من تسجيل الدخول
       صلاحية المدير يفرضها RLS في Supabase
       عبر is_admin() على site_control.
    ========================================= */

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse(
        "يجب تسجيل الدخول أولاً.",
        401
      );
    }

    const body = await request.json();
    const typography = body?.typography;

    if (!isValidTypography(typography)) {
      return errorResponse(
        "بيانات أحجام الخطوط غير صحيحة.",
        400
      );
    }

    /* =========================================
       نحصل على سجل site_control
    ========================================= */

    const activeCafe = await getActiveCafeServer();
    if (!activeCafe) return errorResponse("لم يتم تحديد المقهى.", 400);

    const {
      data: current,
      error: loadError,
    } = await supabase
      .from("site_control")
      .select("id")
      .eq("cafe_id", activeCafe.id)
      .maybeSingle();

    if (loadError) {
      console.error(
        "Failed to load site_control:",
        loadError
      );

      return errorResponse(
        "تعذر تحميل إعدادات الموقع.",
        500
      );
    }

    if (!current) {
      return errorResponse(
        "لم يتم العثور على سجل إعدادات الموقع.",
        404
      );
    }

    /* =========================================
       الحفظ

       سياسة site_control_update_admin في Supabase
       تستخدم is_admin()، لذلك لا نحتاج إلى قراءة
       admin_users مباشرة من API.
    ========================================= */

    const {
      data,
      error: updateError,
    } = await supabase
      .from("site_control")
      .update({
        typography,
      })
      .eq("id", current.id)
      .eq("cafe_id", activeCafe.id)
      .select("*")
      .single();

    if (updateError) {
      console.error(
        "Failed to update typography:",
        updateError
      );

      /*
       * عندما تمنع RLS التعديل، Supabase عادةً لا
       * يعيد صفًا مطابقًا، وبالتالي يظهر خطأ single().
       */
      if (
        updateError.code === "PGRST116" ||
        updateError.code === "42501"
      ) {
        return errorResponse(
          "ليس لديك صلاحية تعديل إعدادات الموقع.",
          403
        );
      }

      return errorResponse(
        updateError.message ||
          "تعذر حفظ أحجام الخطوط.",
        500
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error(
      "Typography API error:",
      error
    );

    return errorResponse(
      error instanceof Error
        ? error.message
        : "حدث خطأ غير متوقع أثناء حفظ أحجام الخطوط.",
      500
    );
  }
}