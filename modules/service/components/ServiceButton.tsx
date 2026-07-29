"use client";

import { ServiceType } from "../types/service";

type ServiceButtonProps = {
  type: ServiceType;
  label: string;
  onClick: (type: ServiceType) => void;
};

export default function ServiceButton({
  type,
  label,
  onClick,
}: ServiceButtonProps) {
  return (
    <button
      onClick={() => onClick(type)}
      className="w-full rounded-2xl border border-yellow-500 bg-zinc-900 p-6 text-xl font-bold text-white transition hover:bg-yellow-400 hover:text-black"
    >
      {label}
    </button>
  );
}