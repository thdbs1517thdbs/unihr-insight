import type { ExcelRow, LedgerField } from "@/lib/excel/types";

export const LEDGER_FIELD_TO_DB_COLUMN: Record<LedgerField, string> = {
  name: "name",
  birthDate: "birth_date",
  gender: "gender",
  employeeCategory: "employee_category",
  orgType: "organization_category",
  parentOrg: "parent_organization",
  department: "department",
  jobGroup: "job_group",
  jobGrade: "position",
  facultyType: "faculty_type",
  nonFulltimeType: "non_tenure_type",
  employmentType: "employment_type",
  firstAppointDate: "first_appointment_date",
  currentGradeDate: "current_position_date",
  contractStart: "contract_start_date",
  contractEnd: "contract_end_date",
  employmentStatus: "employment_status",
  leaveStart: "leave_start_date",
  leaveEnd: "expected_leave_end_date",
  retireDate: "retirement_date",
  asOfDate: "reference_date",
};

export const LEDGER_FIELDS = Object.keys(
  LEDGER_FIELD_TO_DB_COLUMN,
) as LedgerField[];

export function emptyToNull(value: string): string | null {
  return value === "" ? null : value;
}

export function excelRowToCreatedPayload(row: ExcelRow): Record<string, string | null> {
  const payload: Record<string, string | null> = {
    employee_id: row.employeeId,
  };

  for (const field of LEDGER_FIELDS) {
    payload[LEDGER_FIELD_TO_DB_COLUMN[field]] = emptyToNull(row[field]);
  }

  return payload;
}
