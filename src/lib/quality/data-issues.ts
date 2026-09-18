import { QUALITY_ISSUE_TYPES } from "@/lib/quality/types";
import type { QualityIssue, QualityIssueType, QualityReviewStatus } from "@/lib/quality/types";
import { QUALITY_REVIEW_STATUSES } from "@/lib/quality/types";

export const QUALITY_DATASET_TYPE = "quality_check";

export function isQualityReviewStatus(
  value: string,
): value is QualityReviewStatus {
  return (QUALITY_REVIEW_STATUSES as readonly string[]).includes(value);
}

export function isQualityIssueTypeValue(
  value: string,
): value is QualityIssueType {
  return (QUALITY_ISSUE_TYPES as readonly string[]).includes(value);
}

export function resolvedAtForStatus(status: QualityReviewStatus) {
  if (status === "처리 완료") {
    return "now";
  }
  return null;
}

export function toDataIssueInsertRow(issue: QualityIssue) {
  return {
    upload_id: null,
    dataset_type: QUALITY_DATASET_TYPE,
    employee_id: issue.employeeId || null,
    row_number: null as number | null,
    issue_type: issue.issueType,
    field_name: issue.field,
    issue_description: issue.message,
    issue_status: "확인 필요" as QualityReviewStatus,
  };
}
