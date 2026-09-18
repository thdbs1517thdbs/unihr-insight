export const REPORT_TYPES = [
  "monthly",
  "composition",
  "verification",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  monthly: "월간 인사현황 보고",
  composition: "교직원 구성 현황 보고",
  verification: "통계자료 검증 결과 보고",
};

export const REPORT_TONES = ["concise", "detailed"] as const;

export type ReportTone = (typeof REPORT_TONES)[number];

export const REPORT_TONE_LABELS: Record<ReportTone, string> = {
  concise: "간결한 보고형",
  detailed: "상세 분석형",
};

export type NamedCount = {
  label: string;
  count: number;
};

export type SnapshotStat = {
  snapshotDate: string;
  total: number;
  faculty: number | null;
  staff: number | null;
};

export type VerificationMismatchStat = {
  reportCategory: string;
  detailCategory: string;
  sourceCount: number | null;
  reportedCount: number | null;
  difference: number | null;
};

export type ReportStats = {
  asOfDate: string | null;
  headcount: {
    total: number;
    faculty: number;
    staff: number;
    leave: number;
  };
  faculty: {
    types: NamedCount[];
    grades: NamedCount[];
    nonTenureTypes: NamedCount[];
  };
  staff: {
    employmentTypes: NamedCount[];
    jobGroups: NamedCount[];
  };
  snapshots: SnapshotStat[];
  verification:
    | {
        available: true;
        total: number;
        matched: number;
        mismatched: number;
        pending: number;
        matchRate: number;
        mismatches: VerificationMismatchStat[];
      }
    | { available: false };
};

export type GeneratedReport = {
  title: string;
  asOfDate: string | null;
  generatedAt: string;
  body: string;
  reportType: ReportType;
  tone: ReportTone;
};
