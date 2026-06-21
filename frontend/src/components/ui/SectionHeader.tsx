interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="flex shrink-0 items-center gap-3">
          {action}
        </div>
      ) : null}
    </div>
  );
}