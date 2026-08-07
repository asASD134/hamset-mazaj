"use client";

import { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

export default function DashboardLayout({
  title,
  description,
  children,
}: Props) {
  return (
    <main className="space-y-8">
      <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 p-8">
        <h1 className="text-4xl font-bold text-yellow-400">
          {title}
        </h1>

        <p className="mt-3 text-zinc-400">
          {description}
        </p>
      </div>

      {children}
    </main>
  );
}