import { formatNumber } from "@/lib/format";
import type { SnapshotTrend } from "@/lib/dashboard/types";

type TrendPanelProps = {
  snapshots: SnapshotTrend[];
};

function formatSnapshotLabel(snapshotDate: string) {
  const [year, month, day] = snapshotDate.slice(0, 10).split("-");
  if (!year || !month || !day) {
    return snapshotDate;
  }
  return `${year}.${month}.${day}`;
}

export function TrendPanel({ snapshots }: TrendPanelProps) {
  const maxTotal = Math.max(...snapshots.map((item) => item.total), 1);
  const hasBreakdown = snapshots.some(
    (item) => item.faculty !== null || item.staff !== null,
  );

  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-navy-900">최근 3개년 인원 추이</h2>
      <p className="mt-1 text-xs text-muted">hr_snapshots 기준 현재원</p>

      {snapshots.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">표시할 스냅샷이 없습니다.</p>
      ) : (
        <>
          <div className="mt-6 flex h-44 items-end gap-6">
            {snapshots.map((item) => {
              const height = `${Math.round((item.total / maxTotal) * 100)}%`;
              const label = formatSnapshotLabel(item.snapshotDate);
              return (
                <div
                  key={item.snapshotDate}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <p className="tabular text-xs font-medium text-navy-900">
                    {formatNumber(item.total)}
                  </p>
                  <div className="flex h-32 w-full items-end justify-center">
                    <div
                      className="w-12 rounded-t bg-navy-800 sm:w-16"
                      style={{ height }}
                      title={`${label} ${formatNumber(item.total)}명`}
                    />
                  </div>
                  <p className="tabular text-xs text-muted">{label.slice(0, 4)}</p>
                </div>
              );
            })}
          </div>

          <div
            className={`mt-5 grid gap-2 border-t border-line pt-4 text-xs text-slate-600 ${
              snapshots.length === 3 ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {snapshots.map((item) => (
              <div key={`${item.snapshotDate}-detail`} className="text-center">
                <p className="tabular text-muted">
                  {formatSnapshotLabel(item.snapshotDate)}
                </p>
                <p className="mt-1 tabular">
                  {hasBreakdown && item.faculty !== null && item.staff !== null
                    ? `교원 ${formatNumber(item.faculty)} · 직원 ${formatNumber(item.staff)}`
                    : `${formatNumber(item.total)}명`}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
