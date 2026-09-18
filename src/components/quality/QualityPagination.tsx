import { formatNumber } from "@/lib/format";
import { buildQualityHref } from "@/lib/quality/href";
import { QUALITY_PAGE_SIZE, type QualityFilters } from "@/lib/quality/types";

type QualityPaginationProps = {
  filters: QualityFilters;
  totalCount: number;
};

export function QualityPagination({
  filters,
  totalCount,
}: QualityPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / QUALITY_PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const start = totalCount === 0 ? 0 : (page - 1) * QUALITY_PAGE_SIZE + 1;
  const end = Math.min(page * QUALITY_PAGE_SIZE, totalCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm">
      <p className="tabular text-muted">
        {formatNumber(start)}-{formatNumber(end)} / {formatNumber(totalCount)}건
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <a
            href={buildQualityHref(filters, page - 1)}
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
            href={buildQualityHref(filters, page + 1)}
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
