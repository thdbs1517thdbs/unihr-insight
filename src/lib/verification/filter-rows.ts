import { VERIFICATION_PAGE_SIZE, VERIFICATION_STATUSES } from "./types";
import type {
  DisclosureRow,
  VerificationFilters,
  VerificationStatusFilter,
} from "./types";

export function filterVerificationRows(
  rows: DisclosureRow[],
  filters: VerificationFilters,
) {
  const category = filters.category.toLowerCase();
  const detail = filters.detail.toLowerCase();

  return rows.filter((row) => {
    if (
      category &&
      !row.reportCategory.toLowerCase().includes(category)
    ) {
      return false;
    }
    if (detail && !row.detailCategory.toLowerCase().includes(detail)) {
      return false;
    }
    if (filters.status !== "전체" && row.status !== filters.status) {
      return false;
    }
    return true;
  });
}

export function paginateVerificationRows(rows: DisclosureRow[], page: number) {
  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / VERIFICATION_PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * VERIFICATION_PAGE_SIZE;
  return {
    rows: rows.slice(start, start + VERIFICATION_PAGE_SIZE),
    totalCount,
    page: currentPage,
    totalPages,
  };
}

export function readStatusFilter(value: string): VerificationStatusFilter {
  if (
    value === "전체" ||
    (VERIFICATION_STATUSES as readonly string[]).includes(value)
  ) {
    return value as VerificationStatusFilter;
  }
  return "전체";
}
