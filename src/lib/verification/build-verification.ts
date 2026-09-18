import { formatMatchRate } from "./compare";
import type {
  CategorySummary,
  DisclosureRow,
  VerificationData,
  VerificationKpis,
} from "./types";

function sortRows(rows: DisclosureRow[]) {
  const rank = { 불일치: 0, "확인 필요": 1, 일치: 2 };
  return [...rows].sort((a, b) => {
    if (rank[a.status] !== rank[b.status]) {
      return rank[a.status] - rank[b.status];
    }
    const category = a.reportCategory.localeCompare(b.reportCategory, "ko");
    if (category !== 0) {
      return category;
    }
    return a.detailCategory.localeCompare(b.detailCategory, "ko");
  });
}

export function buildVerificationData(rows: DisclosureRow[]): VerificationData {
  const kpis: VerificationKpis = {
    total: rows.length,
    matched: rows.filter((row) => row.status === "일치").length,
    mismatched: rows.filter((row) => row.status === "불일치").length,
    pending: rows.filter((row) => row.status === "확인 필요").length,
    matchRate: 0,
  };
  kpis.matchRate = formatMatchRate(kpis.matched, kpis.total);

  const categoryMap = new Map<string, CategorySummary>();
  for (const row of rows) {
    const key = row.reportCategory || "미분류";
    const current = categoryMap.get(key) ?? {
      reportCategory: key,
      total: 0,
      matched: 0,
      mismatched: 0,
      pending: 0,
    };
    current.total += 1;
    if (row.status === "일치") current.matched += 1;
    if (row.status === "불일치") current.mismatched += 1;
    if (row.status === "확인 필요") current.pending += 1;
    categoryMap.set(key, current);
  }

  const categories = [...categoryMap.values()].sort((a, b) =>
    a.reportCategory.localeCompare(b.reportCategory, "ko"),
  );

  const universityName =
    rows.find((row) => row.universityName)?.universityName || "한국대학교";
  const referenceYears = [
    ...new Set(rows.map((row) => row.referenceYear).filter(Boolean)),
  ].sort();

  return {
    universityName,
    referenceYears,
    kpis,
    categories,
    rows: sortRows(rows),
  };
}
