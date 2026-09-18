import type { AnalysisData, NamedCount } from "@/lib/analysis/types";
import type { VerificationData } from "@/lib/verification/types";
import type { ReportStats, VerificationMismatchStat } from "./types";

const PII_KEY_PATTERN =
  /(employeeid|employee_id|교직원번호|성명|birth_date|생년월일|email|phone|주민)/i;

function copyCounts(items: NamedCount[]): NamedCount[] {
  return items.map((item) => ({ label: item.label, count: item.count }));
}

export function buildReportStats(
  analysis: AnalysisData,
  verification: VerificationData | null,
): ReportStats {
  const mismatches: VerificationMismatchStat[] = verification
    ? verification.rows
        .filter((row) => row.status === "불일치")
        .map((row) => ({
          reportCategory: row.reportCategory,
          detailCategory: row.detailCategory,
          sourceCount: row.sourceCount,
          reportedCount: row.reportedCount,
          difference: row.difference,
        }))
    : [];

  return {
    asOfDate: analysis.asOfDate,
    headcount: {
      total: analysis.breakdown.kpis.total,
      faculty: analysis.breakdown.kpis.faculty,
      staff: analysis.breakdown.kpis.staff,
      leave: analysis.breakdown.kpis.leave,
    },
    faculty: {
      types: copyCounts(analysis.breakdown.facultyTypes),
      grades: copyCounts(analysis.breakdown.facultyGrades),
      nonTenureTypes: copyCounts(analysis.breakdown.nonTenureTypes),
    },
    staff: {
      employmentTypes: copyCounts(analysis.breakdown.staffEmploymentTypes),
      jobGroups: copyCounts(analysis.breakdown.staffJobGroups),
    },
    snapshots: analysis.snapshots.map((item) => ({
      snapshotDate: item.snapshotDate,
      total: item.total,
      faculty: item.faculty,
      staff: item.staff,
    })),
    verification: verification
      ? {
          available: true,
          total: verification.kpis.total,
          matched: verification.kpis.matched,
          mismatched: verification.kpis.mismatched,
          pending: verification.kpis.pending,
          matchRate: verification.kpis.matchRate,
          mismatches,
        }
      : { available: false },
  };
}

export function reportStatsHasPersonalData(stats: ReportStats) {
  const serialized = JSON.stringify(stats);
  return PII_KEY_PATTERN.test(serialized);
}
