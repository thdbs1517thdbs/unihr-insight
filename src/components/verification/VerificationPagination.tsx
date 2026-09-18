import { formatNumber } from "@/lib/format";
import { buildVerificationHref } from "@/lib/verification/href";
import { VERIFICATION_PAGE_SIZE, type VerificationFilters } from "@/lib/verification/types";

type VerificationPaginationProps = {
  filters: VerificationFilters;
  totalCount: number;
};

export function VerificationPagination({
  filters,
  totalCount,
}: VerificationPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / VERIFICATION_PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const start = totalCount === 0 ? 0 : (page - 1) * VERIFICATION_PAGE_SIZE + 1;
  const end = Math.min(page * VERIFICATION_PAGE_SIZE, totalCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm">
      <p className="tabular text-muted">
        {formatNumber(start)}-{formatNumber(end)} / {formatNumber(totalCount)}건
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <a
            href={buildVerificationHref(filters, page - 1)}
            className="rounded-md border border-line px-3 py-1.5 text-navy-800 hover:bg-slate-50"
          >
            이전
          </a>
        ) : (
          <span className="rounded-md border border-line px-3 py-1.5 text-slate-300">
            이전
          </span>
        )}
        <span className="tabular text-navy-900">
          {formatNumber(page)} / {formatNumber(totalPages)}
        </span>
        {page < totalPages ? (
          <a
            href={buildVerificationHref(filters, page + 1)}
            className="rounded-md border border-line px-3 py-1.5 text-navy-800 hover:bg-slate-50"
          >
            다음
          </a>
        ) : (
          <span className="rounded-md border border-line px-3 py-1.5 text-slate-300">
            다음
          </span>
        )}
      </div>
    </div>
  );
}
