"use client";

import { useEffect, useState } from "react";

import {
  getServiceRequests,
  completeServiceRequest,
} from "@/modules/staff";

import { supabase } from "@/lib/supabase";

type ServiceRequest = {
  id: number;
  table_number: number;
  service_type: string;
  status: string;
  created_at: string;
};

export default function StaffPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  async function loadRequests() {
    const data = await getServiceRequests();
    setRequests(data);
  }

  useEffect(() => {
    loadRequests();

    const channel = supabase
      .channel("service-requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_requests",
        },
        () => {
          loadRequests();

          const audio = new Audio("/sounds/new-order.mp3");
          audio.play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function finish(id: number) {
    await completeServiceRequest(id);
    loadRequests();
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">

      <h1 className="text-4xl font-bold text-center text-yellow-400 mb-10">
        🛎️ شاشة الموظفين
      </h1>

      <div className="space-y-5">

        {requests.length === 0 && (
          <div className="text-center text-gray-400">
            لا توجد طلبات خدمة
          </div>
        )}

        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-zinc-900 border border-yellow-500 rounded-2xl p-6"
          >
            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-2xl font-bold text-yellow-400">
                  طاولة {request.table_number}
                </h2>

                <p className="mt-2">
                  الخدمة:
                  <span className="mr-2 font-bold">
                    {request.service_type}
                  </span>
                </p>

                <p className="text-gray-400 mt-2">
                  {new Date(request.created_at).toLocaleString("ar-SA")}
                </p>

              </div>

              <button
                onClick={() => finish(request.id)}
                disabled={request.status === "completed"}
                className={`px-6 py-3 rounded-xl font-bold ${
                  request.status === "completed"
                    ? "bg-green-700"
                    : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
              >
                {request.status === "completed"
                  ? "تم التنفيذ"
                  : "إنهاء"}
              </button>

            </div>
          </div>
        ))}

      </div>

    </main>
  );
}