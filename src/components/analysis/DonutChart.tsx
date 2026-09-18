import { formatNumber } from "@/lib/format";
import { formatPercent } from "@/lib/analysis/format";
import type { NamedCount } from "@/lib/analysis/types";

type DonutChartProps = {
  title: string;
  note: string;
  items: NamedCount[];
  colors: string[];
  insight?: string;
};

export function DonutChart({
  title,
  note,
  items,
  colors,
  insight,
}: DonutChartProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const stops = items.map((item, index) => {
    const start = items
      .slice(0, index)
      .reduce((sum, current) => sum + (total > 0 ? (current.count / total) * 100 : 0), 0);
    const end = start + (total > 0 ? (item.count / total) * 100 : 0);
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });

  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
      <p className="mt-1 text-xs text-muted">{note}</p>
      {total === 0 ? (
        <p className="mt-6 text-sm text-slate-600">표시할 구성이 없습니다.</p>
      ) : (
        <>
          <div className="mt-5 flex items-center gap-6">
            <div className="relative h-28 w-28 shrink-0">
              <div
                className="h-28 w-28 rounded-full"
                style={{
                  background: `conic-gradient(${stops.join(", ")})`,
                }}
                aria-hidden
              />
              <div className="absolute inset-7 rounded-full bg-white" />
            </div>
            <ul className="min-w-0 flex-1 space-y-2">
              {items.map((item, index) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    {item.label}
                  </span>
                  <span className="tabular text-navy-900">
                    {formatNumber(item.count)}명
                    <span className="ml-2 text-xs text-muted">
                      {formatPercent(item.count, total)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {insight ? <p className="mt-4 text-xs text-slate-600">{insight}</p> : null}
        </>
      )}
    </section>
  );
}
