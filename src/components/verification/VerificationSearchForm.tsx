import {
  VERIFICATION_STATUS_OPTIONS,
  type VerificationFilters,
} from "@/lib/verification/types";

type VerificationSearchFormProps = {
  filters: VerificationFilters;
};

const inputClass =
  "h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy-900 outline-none focus:border-navy-700";

export function VerificationSearchForm({
  filters,
}: VerificationSearchFormProps) {
  return (
    <form method="get" className="border-b border-line px-5 py-4">
      <div className="grid gap-3 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            통계 구분
          </span>
          <input
            name="category"
            defaultValue={filters.category}
            className={inputClass}
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            세부 항목
          </span>
          <input
            name="detail"
            defaultValue={filters.detail}
            className={inputClass}
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            검증 결과
          </span>
          <select
            name="status"
            defaultValue={filters.status}
            className={inputClass}
          >
            {VERIFICATION_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <button
          type="submit"
          className="h-9 rounded-md bg-navy-800 px-4 text-sm font-medium text-white hover:bg-navy-700"
        >
          조회
        </button>
        <a
          href="/verification"
          className="inline-flex h-9 items-center rounded-md border border-line px-4 text-sm text-navy-800 hover:bg-slate-50"
        >
          초기화
        </a>
      </div>
    </form>
  );
}
