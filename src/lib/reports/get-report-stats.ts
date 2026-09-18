import { getAnalysisData } from "@/lib/analysis/get-analysis-data";
import { getVerificationData } from "@/lib/verification/get-verification-data";
import { buildReportStats, reportStatsHasPersonalData } from "./build-context";
import type { ReportStats } from "./types";

export async function getReportStats(): Promise<
  { ok: true; stats: ReportStats } | { ok: false }
> {
  try {
    const [analysis, verification] = await Promise.all([
      getAnalysisData(null),
      getVerificationData(),
    ]);

    if (!analysis.ok) {
      return { ok: false };
    }

    const stats = buildReportStats(
      analysis.data,
      verification.ok ? verification.data : null,
    );

    if (reportStatsHasPersonalData(stats)) {
      return { ok: false };
    }

    return { ok: true, stats };
  } catch {
    return { ok: false };
  }
}
