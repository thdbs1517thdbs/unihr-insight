import { EMPLOYEE_PAGE_SIZE } from "@/lib/employees/types";
import type { EmployeeDirectoryFilters } from "@/lib/employees/types";
import { formatNumber } from "@/lib/format";

type EmployeePaginationProps = {
  filters: EmployeeDirectoryFilters;
  totalCount: number;
};

function buildHref(filters: EmployeeDirectoryFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.employeeNo) params.set("employeeNo", filters.employeeNo);
  if (filters.name) params.set("name", filters.name);
  if (filters.department) params.set("department", filters.department);
  if (filters.category !== "전체") params.set("category", filters.category);
  if (filters.status !== "전체") params.set("status", filters.status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/data?${query}` : "/data";
}

export function EmployeePagination({
  filters,
  totalCount,
}: EmployeePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / EMPLOYEE_PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const start = totalCount === 0 ? 0 : (page - 1) * EMPLOYEE_PAGE_SIZE + 1;
  const end = Math.min(page * EMPLOYEE_PAGE_SIZE, totalCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm">
      <p className="tabular text-muted">
        {formatNumber(start)}-{formatNumber(end)} / {formatNumber(totalCount)}명
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <a
            href={buildHref(filters, page - 1)}
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
            href={buildHref(filters, page + 1)}
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
