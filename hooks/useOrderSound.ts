"use client";

import { useEffect, useRef } from "react";

export function useOrderSound(count: number) {
  const previous = useRef(count);

  useEffect(() => {
    if (count > previous.current) {
      const audio = new Audio("/sounds/new-order.mp3");
      audio.play().catch(() => {});
    }

    previous.current = count;
  }, [count]);
}