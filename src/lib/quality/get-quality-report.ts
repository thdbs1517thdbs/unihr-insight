import { getDataAsOfDate } from "@/lib/employees/get-employee-directory";
import { createSupabaseClient } from "@/lib/supabase/client";
import { parseQualityDate, type QualityEmployee } from "./rules";
import { runQualityCheck } from "./run-quality-check";
import type { QualityReport } from "./types";

function readText(row: Record<string, unknown>, key: string) {
  const value = row[key];
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).replace(/\s+/g, " ").trim();
}

function parseLedgerPayload(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { rows?: unknown }).rows)
  ) {
    return (payload as { rows: unknown[] }).rows;
  }
  return null;
}

function mapEmployee(
  row: Record<string, unknown>,
  rowNumber: number,
): QualityEmployee {
  const dateFields = [
    ["first_appointment_date", "최초임용일"],
    ["current_position_date", "현직급임용일"],
    ["contract_start_date", "계약시작일"],
    ["contract_end_date", "계약종료일"],
    ["leave_start_date", "휴직시작일"],
    ["expected_leave_end_date", "휴직종료예정일"],
    ["retirement_date", "퇴직일"],
  ] as const;

  const parsedDates: Record<string, string> = {};
  const invalidDates: QualityEmployee["invalidDates"] = [];

  for (const [field, label] of dateFields) {
    const result = parseQualityDate(row[field]);
    parsedDates[field] = result.parsed;
    if (result.invalidRaw) {
      invalidDates.push({ field, label, raw: result.invalidRaw });
    }
  }

  return {
    rowNumber,
    employeeId: readText(row, "employee_id"),
    name: readText(row, "name"),
    department: readText(row, "department"),
    employeeCategory: readText(row, "employee_category"),
    employmentStatus: readText(row, "employment_status"),
    employmentType: readText(row, "employment_type"),
    facultyType: readText(row, "faculty_type"),
    nonTenureType: readText(row, "non_tenure_type"),
    firstAppointmentDate: parsedDates.first_appointment_date ?? "",
    currentPositionDate: parsedDates.current_position_date ?? "",
    contractStartDate: parsedDates.contract_start_date ?? "",
    contractEndDate: parsedDates.contract_end_date ?? "",
    leaveStartDate: parsedDates.leave_start_date ?? "",
    expectedLeaveEndDate: parsedDates.expected_leave_end_date ?? "",
    retirementDate: parsedDates.retirement_date ?? "",
    invalidDates,
  };
}

export async function getQualityReport(): Promise<QualityReport> {
  try {
    const supabase = createSupabaseClient();
    const [{ data, error }, asOfDate] = await Promise.all([
      supabase.rpc("get_employee_ledger_for_compare"),
      getDataAsOfDate(),
    ]);

    if (error) {
      return { ok: false };
    }

    const rows = parseLedgerPayload(data);
    if (!rows) {
      return { ok: false };
    }

    const employees = rows.flatMap((row, index) => {
      if (!row || typeof row !== "object") {
        return [];
      }
      return [mapEmployee(row as Record<string, unknown>, index + 1)];
    });

    const checked = runQualityCheck(employees);
    return {
      ok: true,
      asOfDate,
      summary: checked.summary,
      issues: checked.issues,
    };
  } catch {
    return { ok: false };
  }
}
