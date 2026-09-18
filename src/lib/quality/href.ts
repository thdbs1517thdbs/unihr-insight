import type { QualityFilters } from "@/lib/quality/types";

export function buildQualityHref(
  filters: Pick<
    QualityFilters,
    "employeeNo" | "name" | "department" | "issueType" | "reviewStatus"
  >,
  page = 1,
) {
  const params = new URLSearchParams();
  if (filters.employeeNo) params.set("employeeNo", filters.employeeNo);
  if (filters.name) params.set("name", filters.name);
  if (filters.department) params.set("department", filters.department);
  if (filters.issueType !== "전체") params.set("issueType", filters.issueType);
  if (filters.reviewStatus !== "전체") {
    params.set("reviewStatus", filters.reviewStatus);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/quality?${query}` : "/quality";
}
