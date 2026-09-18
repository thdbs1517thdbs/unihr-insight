export const QUALITY_PAGE_SIZE = 20;

export const QUALITY_ISSUE_TYPES = [
  "missing",
  "duplicate",
  "date",
  "category",
  "statusMismatch",
] as const;

export type QualityIssueType = (typeof QUALITY_ISSUE_TYPES)[number];

export const QUALITY_ISSUE_TYPE_LABELS: Record<QualityIssueType, string> = {
  missing: "필수값 누락",
  duplicate: "중복 데이터",
  date: "날짜 오류",
  category: "분류값 오류",
  statusMismatch: "상태 불일치",
};

export const QUALITY_ISSUE_TYPE_OPTIONS = [
  "전체",
  ...QUALITY_ISSUE_TYPES,
] as const;

export type QualityIssueTypeFilter =
  (typeof QUALITY_ISSUE_TYPE_OPTIONS)[number];

export const QUALITY_REVIEW_STATUSES = [
  "확인 필요",
  "확인 중",
  "처리 완료",
] as const;

export type QualityReviewStatus = (typeof QUALITY_REVIEW_STATUSES)[number];

export const QUALITY_REVIEW_STATUS_OPTIONS = [
  "전체",
  ...QUALITY_REVIEW_STATUSES,
] as const;

export type QualityReviewStatusFilter =
  (typeof QUALITY_REVIEW_STATUS_OPTIONS)[number];

export type QualityIssue = {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  issueType: QualityIssueType;
  field: string;
  fieldLabel: string;
  message: string;
  currentValue: string;
  reviewStatus: QualityReviewStatus;
  detectionRule: string;
  persistKey: string;
};

export type QualityFilters = {
  employeeNo: string;
  name: string;
  department: string;
  issueType: QualityIssueTypeFilter;
  reviewStatus: QualityReviewStatusFilter;
  page: number;
};

export type QualitySummary = {
  checkedCount: number;
  normalCount: number;
  issueEmployeeCount: number;
  issueCount: number;
  typeCount: number;
  typeCounts: Record<QualityIssueType, number>;
};

export type QualityReport =
  | {
      ok: true;
      asOfDate: string | null;
      summary: QualitySummary;
      issues: QualityIssue[];
    }
  | { ok: false };
