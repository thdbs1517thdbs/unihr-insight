import { formatNumber } from "@/lib/format";
import { buildQualityHref } from "@/lib/quality/href";
import {
  QUALITY_ISSUE_TYPES,
  QUALITY_ISSUE_TYPE_LABELS,
  type QualityFilters,
  type QualityIssueType,
} from "@/lib/quality/types";

type QualityTypeCardsProps = {
  filters: QualityFilters;
  typeCounts: Record<QualityIssueType, number>;
};

export function QualityTypeCards({
  filters,
  typeCounts,
}: QualityTypeCardsProps) {
  return (
    <section className="mb-6 rounded-lg border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-navy-900">문제 유형별 현황</h2>
      <p className="mt-1 text-xs text-muted">
        유형을 선택하면 아래 목록이 해당 문제 건수로 필터링됩니다.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {QUALITY_ISSUE_TYPES.map((type) => {
          const selected = filters.issueType === type;
          return (
            <a
              key={type}
              href={buildQualityHref(
                {
                  ...filters,
                  issueType: selected ? "전체" : type,
                },
                1,
              )}
              className={`rounded-lg border px-4 py-3 ${
                selected
                  ? "border-navy-800 bg-slate-50"
                  : "border-line bg-white hover:border-navy-800/40"
              }`}
            >
              <p className="text-sm text-navy-900">
                {QUALITY_ISSUE_TYPE_LABELS[type]}
              </p>
              <p className="mt-2 tabular text-2xl font-semibold text-navy-900">
                {formatNumber(typeCounts[type])}
                <span className="ml-1 text-sm font-medium text-slate-500">
                  건
                </span>
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
