import type { VerificationFilters } from "./types";

export function buildVerificationHref(
  filters: Pick<VerificationFilters, "category" | "detail" | "status">,
  page = 1,
) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.detail) params.set("detail", filters.detail);
  if (filters.status !== "전체") params.set("status", filters.status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/verification?${query}` : "/verification";
}
