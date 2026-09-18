import {
  QUALITY_ISSUE_TYPE_LABELS,
  QUALITY_ISSUE_TYPE_OPTIONS,
  QUALITY_REVIEW_STATUS_OPTIONS,
  type QualityFilters,
  type QualityIssueType,
} from "@/lib/quality/types";

type QualitySearchFormProps = {
  filters: QualityFilters;
};

const inputClass =
  "h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy-900 outline-none focus:border-navy-700";

export function QualitySearchForm({ filters }: QualitySearchFormProps) {
  return (
    <form method="get" className="border-b border-line px-5 py-4">
      <div className="grid gap-3 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            교직원번호
          </span>
          <input
            name="employeeNo"
            defaultValue={filters.employeeNo}
            className={`${inputClass} tabular`}
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">성명</span>
          <input
            name="name"
            defaultValue={filters.name}
            className={inputClass}
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">부서</span>
          <input
            name="department"
            defaultValue={filters.department}
            className={inputClass}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            문제 유형
          </span>
          <select
            name="issueType"
            defaultValue={filters.issueType}
            className={inputClass}
          >
            {QUALITY_ISSUE_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "전체"
                  ? "전체"
                  : QUALITY_ISSUE_TYPE_LABELS[option as QualityIssueType]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
            처리상태
          </span>
          <select
            name="reviewStatus"
            defaultValue={filters.reviewStatus}
            className={inputClass}
          >
            {QUALITY_REVIEW_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2">
          <button
            type="submit"
            className="h-9 rounded-md bg-navy-800 px-4 text-sm font-medium text-white hover:bg-navy-700"
          >
            조회
          </button>
          <a
            href="/quality"
            className="inline-flex h-9 items-center rounded-md border border-line px-4 text-sm text-navy-800 hover:bg-slate-50"
          >
            초기화
          </a>
        </div>
      </div>
    </form>
  );
}
