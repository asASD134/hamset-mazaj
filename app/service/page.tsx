"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTable } from "@/context/TableContext";
import {
  createServiceRequest,
  type ServiceType,
} from "@/modules/service";
import {
  BellRing,
  UserRound,
  Coffee,
  Receipt,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const SERVICES = {
  call_waiter: {
    title: "استدعاء النادل",
    icon: UserRound,
  },
  waiter: {
    title: "استدعاء النادل",
    icon: UserRound,
  },
  water: {
    title: "طلب ماء",
    icon: Coffee,
  },
  charcoal: {
    title: "طلب فحم",
    icon: Sparkles,
  },
  bill: {
    title: "طلب الحساب",
    icon: Receipt,
  },
  clean_table: {
    title: "تنظيف الطاولة",
    icon: BellRing,
  },
};

const SERVICE_TYPES: Record<string, ServiceType> = {
  call_waiter: "call_waiter",
  waiter: "call_waiter",
  water: "water",
  charcoal: "charcoal",
  bill: "bill",
  clean_table: "clean_table",
};

export default function ServicePage() {
  const { hasTable, tableNumber } = useTable();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const serviceKey =
    searchParams.get("type") || "call_waiter";

  const service = useMemo(() => {
    return (
      SERVICES[serviceKey as keyof typeof SERVICES] ??
      SERVICES.call_waiter
    );
  }, [serviceKey]);

  const Icon = service.icon;

  async function sendRequest() {
    if (!hasTable || !tableNumber) return;

    setLoading(true);

    try {
      await createServiceRequest(
        tableNumber,
        SERVICE_TYPES[serviceKey] ?? "call_waiter"
      );

      alert(
        `تم إرسال الطلب بنجاح

رقم الطاولة: ${tableNumber}

الخدمة:
${service.title}`
      );

      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (!hasTable) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6">

        <div className="max-w-md rounded-3xl border border-yellow-500/20 bg-zinc-900 p-10 text-center">

          <BellRing
            size={70}
            className="mx-auto mb-6 text-yellow-400"
          />

          <h1 className="text-3xl font-black text-yellow-400">
            هذه الصفحة مخصصة لعملاء الطاولات
          </h1>

          <p className="mt-5 leading-8 text-zinc-400">
            للوصول إلى خدمات الطاولة يرجى مسح
            QR الموجود على الطاولة.
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black py-16 px-6">

      <div className="mx-auto max-w-3xl">

        <div className="mb-12 text-center">

          <div className="mb-5 inline-flex rounded-full bg-yellow-500/10 p-5">

            <Icon
              size={42}
              className="text-yellow-400"
            />

          </div>

          <h1 className="text-5xl font-black text-white">
            خدمات الطاولة
          </h1>

          <p className="mt-4 text-lg text-zinc-400">
            الطاولة رقم{" "}
            <span className="font-bold text-yellow-400">
              {tableNumber}
            </span>
          </p>

        </div>

        <div className="rounded-[32px] border border-yellow-500/20 bg-zinc-900 p-10 shadow-2xl">

          <div className="mb-10 text-center">

            <p className="text-zinc-400">
              الخدمة المختارة
            </p>

            <h2 className="mt-4 text-4xl font-black text-yellow-400">
              {service.title}
            </h2>

          </div>

          {success ? (
            <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-10 text-center">

              <CheckCircle2
                size={70}
                className="mx-auto mb-5 text-green-400"
              />

              <h3 className="text-3xl font-black text-white">
                تم إرسال الطلب
              </h3>

              <p className="mt-4 leading-8 text-zinc-300">
                تم إشعار موظفي المقهى وسيتم
                تلبية طلبكم في أقرب وقت.
              </p>

            </div>
          ) : (
            <button
              onClick={sendRequest}
              disabled={loading}
              className="w-full rounded-2xl bg-yellow-500 py-5 text-2xl font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "جارٍ إرسال الطلب..."
                : "إرسال الطلب"}
            </button>
          )}

        </div>

      </div>

    </main>
  );
}
