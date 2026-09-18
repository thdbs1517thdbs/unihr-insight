import { qualityStatus } from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";

const severityLabel = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

const severityClass = {
  high: "text-red-700",
  medium: "text-amber-700",
  low: "text-slate-600",
};

export function QualityStatusPanel() {
  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-navy-900">
            데이터 품질 확인 현황
          </h2>
          <p className="mt-1 text-xs text-muted">
            최근 점검 {qualityStatus.checkedAt}
          </p>
        </div>
        <p className="text-right">
          <span className="block text-xs text-muted">점검 통과율</span>
          <span className="tabular text-xl font-semibold text-navy-900">
            {qualityStatus.passRate.toFixed(1)}%
          </span>
        </p>
      </div>

      <ul className="mt-4 divide-y divide-line border-t border-line">
        {qualityStatus.items.map((item) => (
          <li key={item.label} className="flex items-center justify-between py-3 text-sm">
            <span className="text-slate-700">{item.label}</span>
            <span className="flex items-center gap-3">
              <span className={`text-xs ${severityClass[item.severity]}`}>
                {severityLabel[item.severity]}
              </span>
              <span className="tabular font-medium text-navy-900">
                {formatNumber(item.count)}건
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
