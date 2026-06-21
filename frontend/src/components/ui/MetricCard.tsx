import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  accent?: string;
}

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  accent = "bg-brand-50 text-brand-700",
}: MetricCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>
        </div>

        <div className={`rounded-2xl p-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {detail}
      </p>
    </div>
  );
}