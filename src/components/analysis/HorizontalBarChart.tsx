import { formatNumber } from "@/lib/format";
import { formatPercent } from "@/lib/analysis/format";
import type { NamedCount } from "@/lib/analysis/types";

type HorizontalBarChartProps = {
  title: string;
  note: string;
  items: NamedCount[];
  insight?: string;
};

export function HorizontalBarChart({
  title,
  note,
  items,
  insight,
}: HorizontalBarChartProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
      <p className="mt-1 text-xs text-muted">{note}</p>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">표시할 구성이 없습니다.</p>
      ) : (
        <>
          <ul className="mt-4 space-y-3">
            {items.map((item) => {
              const share = formatPercent(item.count, total);
              return (
                <li key={item.label}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="tabular text-navy-900">
                      {formatNumber(item.count)}명
                      <span className="ml-2 text-xs text-muted">
                        {share}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-slate-100">
                    <div
                      className="h-full rounded bg-navy-800"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          {insight ? <p className="mt-4 text-xs text-slate-600">{insight}</p> : null}
        </>
      )}
    </section>
  );
}
