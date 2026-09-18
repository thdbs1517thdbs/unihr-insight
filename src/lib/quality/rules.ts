import { parseDateValue } from "@/lib/excel/normalize";
import type { QualityIssue, QualityIssueType } from "./types";

export type QualityEmployee = {
  rowNumber: number;
  employeeId: string;
  name: string;
  department: string;
  employeeCategory: string;
  employmentStatus: string;
  employmentType: string;
  facultyType: string;
  nonTenureType: string;
  firstAppointmentDate: string;
  currentPositionDate: string;
  contractStartDate: string;
  contractEndDate: string;
  leaveStartDate: string;
  expectedLeaveEndDate: string;
  retirementDate: string;
  invalidDates: { field: string; label: string; raw: string }[];
};

const CATEGORY_VALUES = new Set(["교원", "직원"]);
const STATUS_VALUES = new Set(["재직", "휴직", "퇴직"]);
const EMPLOYMENT_TYPE_VALUES = new Set(["정규직", "무기계약직", "기간제"]);
const FACULTY_TYPE_VALUES = new Set(["전임교원", "비전임교원"]);
const NON_TENURE_TYPE_VALUES = new Set(["강사", "겸임교원", "초빙교원"]);

function displayValue(value: string) {
  return value || "—";
}

function detectionRuleFor(issueType: QualityIssueType, fieldLabel: string) {
  if (issueType === "missing") {
    return `필수값 검증: ${fieldLabel}은(는) 비어 있으면 안 됩니다.`;
  }
  if (issueType === "duplicate") {
    return "중복 검증: 동일한 교직원번호가 원장에 둘 이상 있으면 안 됩니다.";
  }
  if (issueType === "date") {
    return `날짜 검증: ${fieldLabel}의 형식과 선후 관계를 확인합니다.`;
  }
  if (issueType === "category") {
    return `분류값 검증: ${fieldLabel}은(는) 허용된 값만 사용할 수 있습니다.`;
  }
  return `상태-날짜 검증: 재직상태와 ${fieldLabel}이 일치해야 합니다.`;
}

export function qualityPersistKey(
  employeeId: string,
  issueType: QualityIssueType,
  field: string,
) {
  return `${employeeId}|${issueType}|${field}`;
}

function pushIssue(
  issues: QualityIssue[],
  employee: QualityEmployee,
  issueType: QualityIssueType,
  field: string,
  fieldLabel: string,
  message: string,
  currentValue: string,
) {
  issues.push({
    id: `${employee.employeeId || "empty"}-${employee.rowNumber}-${field}-${issueType}`,
    employeeId: employee.employeeId,
    name: employee.name,
    department: employee.department,
    issueType,
    field,
    fieldLabel,
    message,
    currentValue: displayValue(currentValue),
    reviewStatus: "확인 필요",
    detectionRule: detectionRuleFor(issueType, fieldLabel),
    persistKey: qualityPersistKey(employee.employeeId, issueType, field),
  });
}

function bothDatesOutOfOrder(start: string, end: string) {
  return Boolean(start && end && start > end);
}

export function inspectEmployee(
  employee: QualityEmployee,
  idCounts: Map<string, number>,
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (!employee.employeeId) {
    pushIssue(
      issues,
      employee,
      "missing",
      "employee_id",
      "교직원번호",
      "필수값인 교직원번호가 입력되지 않았습니다.",
      employee.employeeId,
    );
  } else if ((idCounts.get(employee.employeeId) ?? 0) > 1) {
    pushIssue(
      issues,
      employee,
      "duplicate",
      "employee_id",
      "교직원번호",
      "동일한 교직원번호가 원장에 두 건 이상 있습니다.",
      employee.employeeId,
    );
  }

  if (!employee.name) {
    pushIssue(
      issues,
      employee,
      "missing",
      "name",
      "성명",
      "필수값인 성명이 입력되지 않았습니다.",
      employee.name,
    );
  }

  if (!employee.employeeCategory) {
    pushIssue(
      issues,
      employee,
      "missing",
      "employee_category",
      "교직원구분",
      "필수값인 교직원구분이 입력되지 않았습니다.",
      employee.employeeCategory,
    );
  } else if (!CATEGORY_VALUES.has(employee.employeeCategory)) {
    pushIssue(
      issues,
      employee,
      "category",
      "employee_category",
      "교직원구분",
      "교직원구분은 교원 또는 직원이어야 합니다.",
      employee.employeeCategory,
    );
  }

  if (!employee.department) {
    pushIssue(
      issues,
      employee,
      "missing",
      "department",
      "소속부서",
      "필수값인 소속부서가 입력되지 않았습니다.",
      employee.department,
    );
  }

  if (!employee.employmentStatus) {
    pushIssue(
      issues,
      employee,
      "missing",
      "employment_status",
      "재직상태",
      "필수값인 재직상태가 입력되지 않았습니다.",
      employee.employmentStatus,
    );
  } else if (!STATUS_VALUES.has(employee.employmentStatus)) {
    pushIssue(
      issues,
      employee,
      "category",
      "employment_status",
      "재직상태",
      "재직상태는 재직, 휴직, 퇴직 중 하나여야 합니다.",
      employee.employmentStatus,
    );
  }

  if (!employee.employmentType) {
    pushIssue(
      issues,
      employee,
      "missing",
      "employment_type",
      "고용형태",
      "필수값인 고용형태가 입력되지 않았습니다.",
      employee.employmentType,
    );
  } else if (!EMPLOYMENT_TYPE_VALUES.has(employee.employmentType)) {
    pushIssue(
      issues,
      employee,
      "category",
      "employment_type",
      "고용형태",
      "고용형태는 정규직, 무기계약직, 기간제 중 하나여야 합니다.",
      employee.employmentType,
    );
  }

  if (employee.employeeCategory === "교원") {
    if (!employee.facultyType) {
      pushIssue(
        issues,
        employee,
        "category",
        "faculty_type",
        "교원유형",
        "교원은 교원유형이 입력되어야 합니다.",
        employee.facultyType,
      );
    } else if (!FACULTY_TYPE_VALUES.has(employee.facultyType)) {
      pushIssue(
        issues,
        employee,
        "category",
        "faculty_type",
        "교원유형",
        "교원유형은 전임교원 또는 비전임교원이어야 합니다.",
        employee.facultyType,
      );
    }
  } else if (employee.facultyType) {
    pushIssue(
      issues,
      employee,
      "category",
      "faculty_type",
      "교원유형",
      "직원이면 교원유형을 입력하지 않습니다.",
      employee.facultyType,
    );
  }

  if (employee.facultyType === "비전임교원") {
    if (!employee.nonTenureType) {
      pushIssue(
        issues,
        employee,
        "category",
        "non_tenure_type",
        "비전임유형",
        "비전임교원은 비전임유형이 입력되어야 합니다.",
        employee.nonTenureType,
      );
    } else if (!NON_TENURE_TYPE_VALUES.has(employee.nonTenureType)) {
      pushIssue(
        issues,
        employee,
        "category",
        "non_tenure_type",
        "비전임유형",
        "비전임유형은 강사, 겸임교원, 초빙교원 중 하나여야 합니다.",
        employee.nonTenureType,
      );
    }
  } else if (employee.nonTenureType) {
    pushIssue(
      issues,
      employee,
      "category",
      "non_tenure_type",
      "비전임유형",
      "비전임교원이 아니면 비전임유형을 입력하지 않습니다.",
      employee.nonTenureType,
    );
  }

  for (const invalid of employee.invalidDates) {
    pushIssue(
      issues,
      employee,
      "date",
      invalid.field,
      invalid.label,
      `${invalid.label} 날짜 형식이 올바르지 않습니다.`,
      invalid.raw,
    );
  }

  if (
    bothDatesOutOfOrder(employee.contractStartDate, employee.contractEndDate)
  ) {
    pushIssue(
      issues,
      employee,
      "date",
      "contract_end_date",
      "계약종료일",
      "계약시작일이 계약종료일보다 늦습니다.",
      `${employee.contractStartDate} ~ ${employee.contractEndDate}`,
    );
  }

  if (
    bothDatesOutOfOrder(
      employee.leaveStartDate,
      employee.expectedLeaveEndDate,
    )
  ) {
    pushIssue(
      issues,
      employee,
      "date",
      "expected_leave_end_date",
      "휴직종료예정일",
      "휴직시작일이 휴직종료예정일보다 늦습니다.",
      `${employee.leaveStartDate} ~ ${employee.expectedLeaveEndDate}`,
    );
  }

  if (
    bothDatesOutOfOrder(
      employee.firstAppointmentDate,
      employee.currentPositionDate,
    )
  ) {
    pushIssue(
      issues,
      employee,
      "date",
      "current_position_date",
      "현직급임용일",
      "최초임용일이 현직급임용일보다 늦습니다.",
      `${employee.firstAppointmentDate} ~ ${employee.currentPositionDate}`,
    );
  }

  if (employee.employmentStatus === "휴직" && !employee.leaveStartDate) {
    pushIssue(
      issues,
      employee,
      "statusMismatch",
      "leave_start_date",
      "휴직시작일",
      "휴직 상태이나 휴직시작일이 입력되지 않았습니다.",
      employee.leaveStartDate,
    );
  }

  if (employee.employmentStatus === "퇴직" && !employee.retirementDate) {
    pushIssue(
      issues,
      employee,
      "statusMismatch",
      "retirement_date",
      "퇴직일",
      "퇴직 상태이나 퇴직일이 입력되지 않았습니다.",
      employee.retirementDate,
    );
  }

  if (employee.employmentStatus === "재직" && employee.retirementDate) {
    pushIssue(
      issues,
      employee,
      "statusMismatch",
      "retirement_date",
      "퇴직일",
      "재직 상태인데 퇴직일이 입력되어 있습니다.",
      employee.retirementDate,
    );
  }

  return issues;
}

export function parseQualityDate(
  raw: unknown,
): { parsed: string; invalidRaw: string | null } {
  const text =
    raw === null || raw === undefined
      ? ""
      : String(raw).replace(/\s+/g, " ").trim();
  const parsed = parseDateValue(raw);
  if (parsed.ok) {
    return { parsed: parsed.value, invalidRaw: null };
  }
  return { parsed: "", invalidRaw: text || "—" };
}
