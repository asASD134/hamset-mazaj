"use client";

interface Props {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = "text-yellow-400",
}: Props) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6 transition hover:border-yellow-500/50">

      <div className="flex items-center justify-between">

        <span className="text-4xl">
          {icon}
        </span>

        <span className={`text-4xl font-bold ${color}`}>
          {value}
        </span>

      </div>

      <p className="mt-4 text-lg text-zinc-400">
        {title}
      </p>

    </div>
  );
}