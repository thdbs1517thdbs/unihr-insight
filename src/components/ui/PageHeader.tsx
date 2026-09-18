type PageHeaderProps = {
  title: string;
  description: string;
  step?: string;
};

export function PageHeader({ title, description, step }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {step ? (
        <span className="rounded border border-navy-800/20 bg-white px-2.5 py-1 text-xs font-medium tracking-wide text-navy-800">
          {step}
        </span>
      ) : null}
    </div>
  );
}
