"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function useRealtimeOrders(refresh: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/new-order.mp3");

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        () => {
          audioRef.current
            ?.play()
            .catch(() => {});

          refresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        () => {
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);
}