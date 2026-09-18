import { formatNumber } from "@/lib/format";

type CompositionItem = {
  label: string;
  count: number;
  color: string;
};

type CompositionPanelProps = {
  items: CompositionItem[];
};

export function CompositionPanel({ items }: CompositionPanelProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-navy-900">교직원 구성 현황</h2>
      <p className="mt-1 text-xs text-muted">재직상태 퇴직 제외, 신분별 구성</p>

      {total === 0 ? (
        <p className="mt-6 text-sm text-slate-600">표시할 구성 현황이 없습니다.</p>
      ) : (
        <>
          <div className="mt-4 flex h-3 overflow-hidden rounded bg-slate-100">
            {items.map((item) => (
              <div
                key={item.label}
                className="h-full"
                style={{
                  width: `${(item.count / total) * 100}%`,
                  backgroundColor: item.color,
                }}
                title={`${item.label} ${formatNumber(item.count)}명`}
              />
            ))}
          </div>

          <ul className="mt-5 space-y-3">
            {items.map((item) => {
              const percent = ((item.count / total) * 100).toFixed(1);
              return (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="tabular text-navy-900">
                    {formatNumber(item.count)}명
                    <span className="ml-2 text-xs text-muted">{percent}%</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
