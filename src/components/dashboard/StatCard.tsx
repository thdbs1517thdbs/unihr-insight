import { formatNumber } from "@/lib/format";

type StatCardProps = {
  label: string;
  value: number;
  unit: string;
  note: string;
  tone: "navy" | "blue" | "slate" | "amber";
};

const toneClass = {
  navy: "border-navy-800/20",
  blue: "border-blue-700/20",
  slate: "border-slate-300",
  amber: "border-amber-300/70",
};

export function StatCard({ label, value, unit, note, tone }: StatCardProps) {
  return (
    <article className={`rounded-lg border bg-white p-5 ${toneClass[tone]}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 flex items-baseline gap-1 text-navy-900">
        <span className="tabular text-3xl font-semibold tracking-tight">
          {formatNumber(value)}
        </span>
        <span className="text-sm font-medium text-slate-500">{unit}</span>
      </p>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </article>
  );
}
