import { QUALITY_ISSUE_TYPES, QUALITY_PAGE_SIZE } from "./types";
import type {
  QualityFilters,
  QualityIssue,
  QualityIssueType,
  QualityIssueTypeFilter,
  QualityReviewStatusFilter,
} from "./types";

export function filterQualityIssues(
  issues: QualityIssue[],
  filters: QualityFilters,
) {
  const employeeNo = filters.employeeNo.toLowerCase();
  const name = filters.name.toLowerCase();
  const department = filters.department.toLowerCase();

  return issues.filter((issue) => {
    if (employeeNo && !issue.employeeId.toLowerCase().includes(employeeNo)) {
      return false;
    }
    if (name && !issue.name.toLowerCase().includes(name)) {
      return false;
    }
    if (
      department &&
      !issue.department.toLowerCase().includes(department)
    ) {
      return false;
    }
    if (filters.issueType !== "전체" && issue.issueType !== filters.issueType) {
      return false;
    }
    if (
      filters.reviewStatus !== "전체" &&
      issue.reviewStatus !== filters.reviewStatus
    ) {
      return false;
    }
    return true;
  });
}

export function paginateQualityIssues(issues: QualityIssue[], page: number) {
  const totalCount = issues.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / QUALITY_PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * QUALITY_PAGE_SIZE;
  return {
    rows: issues.slice(start, start + QUALITY_PAGE_SIZE),
    totalCount,
    page: currentPage,
    totalPages,
  };
}

export function isQualityIssueType(
  value: string,
): value is QualityIssueType {
  return (QUALITY_ISSUE_TYPES as readonly string[]).includes(value);
}

export function readIssueTypeFilter(value: string): QualityIssueTypeFilter {
  if (value === "전체" || isQualityIssueType(value)) {
    return value;
  }
  return "전체";
}

export function readReviewStatusFilter(
  value: string,
): QualityReviewStatusFilter {
  if (value === "전체" || value === "확인 필요" || value === "확인 중" || value === "처리 완료") {
    return value;
  }
  return "전체";
}
