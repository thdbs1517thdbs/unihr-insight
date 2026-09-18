import { formatDateLabel } from "@/lib/analysis/format";
import { formatNumber } from "@/lib/format";
import type { SnapshotPoint } from "@/lib/analysis/types";

type TrendLineChartProps = {
  snapshots: SnapshotPoint[];
};

function pointX(index: number, count: number) {
  if (count <= 1) {
    return 20;
  }
  return 20 + (index / (count - 1)) * 360;
}

function pointY(value: number, max: number) {
  if (max <= 0) {
    return 120;
  }
  return 120 - (value / max) * 100;
}

function polyline(values: number[], max: number, count: number) {
  return values
    .map((value, index) => `${pointX(index, count)},${pointY(value, max)}`)
    .join(" ");
}

export function TrendLineChart({ snapshots }: TrendLineChartProps) {
  const max = Math.max(
    ...snapshots.flatMap((item) => [
      item.total,
      item.faculty ?? 0,
      item.staff ?? 0,
    ]),
    1,
  );
  const totals = snapshots.map((item) => item.total);
  const faculty = snapshots.map((item) => item.faculty ?? 0);
  const staff = snapshots.map((item) => item.staff ?? 0);
  const count = snapshots.length;

  return (
    <section className="mb-6 rounded-lg border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-navy-900">인력 추이</h2>
      <p className="mt-1 text-xs text-muted">
        hr_snapshots 기준 대학 전체 현재원입니다. 조직 필터와 무관합니다.
      </p>
      {snapshots.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">표시할 스냅샷이 없습니다.</p>
      ) : (
        <>
          <svg
            viewBox="0 0 400 150"
            className="mt-5 h-48 w-full"
            role="img"
            aria-label="총원·교원·직원 추이"
          >
            <polyline
              fill="none"
              stroke="#1b3a63"
              strokeWidth="2.5"
              points={polyline(totals, max, count)}
            />
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={polyline(faculty, max, count)}
            />
            <polyline
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              points={polyline(staff, max, count)}
            />
            {snapshots.map((item, index) => (
              <circle
                key={item.snapshotDate}
                cx={pointX(index, count)}
                cy={pointY(item.total, max)}
                r="3.5"
                fill="#1b3a63"
              />
            ))}
          </svg>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-navy-800" /> 총원
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-blue-600" /> 교원
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-slate-500" /> 직원
            </span>
          </div>
          <div className="mt-4 grid gap-2 border-t border-line pt-4 text-xs sm:grid-cols-3">
            {snapshots.map((item) => (
              <div key={item.snapshotDate} className="text-slate-600">
                <p className="tabular text-muted">
                  {formatDateLabel(item.snapshotDate)}
                </p>
                <p className="mt-1 tabular text-navy-900">
                  총원 {formatNumber(item.total)}명
                </p>
                {item.faculty !== null && item.staff !== null ? (
                  <p className="tabular">
                    교원 {formatNumber(item.faculty)} · 직원{" "}
                    {formatNumber(item.staff)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
