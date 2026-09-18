import { createSupabaseClient } from "@/lib/supabase/client";
import { parseDateValue } from "@/lib/excel/normalize";
import { FULL_COMPARE_FIELDS, type LedgerField, type LedgerRecord } from "@/lib/excel/types";

function readRaw(row: Record<string, unknown>, key: string) {
  return row[key];
}

function readText(row: Record<string, unknown>, key: string) {
  const value = readRaw(row, key);
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).replace(/\s+/g, " ").trim();
}

function readDate(row: Record<string, unknown>, key: string) {
  const parsed = parseDateValue(readRaw(row, key));
  if (parsed.ok) {
    return parsed.value;
  }
  return "";
}

function mapLedgerRow(row: Record<string, unknown>): LedgerRecord | null {
  const employeeId = readText(row, "employee_id");
  if (!employeeId) {
    return null;
  }

  const record: LedgerRecord = {
    employeeId,
    name: readText(row, "name"),
    birthDate: readDate(row, "birth_date"),
    gender: readText(row, "gender"),
    employeeCategory: readText(row, "employee_category"),
    orgType: readText(row, "organization_category"),
    parentOrg: readText(row, "parent_organization"),
    department: readText(row, "department"),
    jobGroup: readText(row, "job_group"),
    jobGrade: readText(row, "position"),
    facultyType: readText(row, "faculty_type"),
    nonFulltimeType: readText(row, "non_tenure_type"),
    employmentType: readText(row, "employment_type"),
    firstAppointDate: readDate(row, "first_appointment_date"),
    currentGradeDate: readDate(row, "current_position_date"),
    contractStart: readDate(row, "contract_start_date"),
    contractEnd: readDate(row, "contract_end_date"),
    employmentStatus: readText(row, "employment_status"),
    leaveStart: readDate(row, "leave_start_date"),
    leaveEnd: readDate(row, "expected_leave_end_date"),
    retireDate: readDate(row, "retirement_date"),
    asOfDate: readDate(row, "reference_date"),
  };

  return record;
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

export type LedgerSnapshot =
  | {
      ok: true;
      records: Map<string, LedgerRecord>;
      fields: LedgerField[];
      source: "ledger";
    }
  | { ok: false; message: string };

export async function getLedgerForCompare(): Promise<LedgerSnapshot> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.rpc("get_employee_ledger_for_compare");

    if (error) {
      return {
        ok: false,
        message: error.message || "원장 비교 데이터를 불러오지 못했습니다.",
      };
    }

    const rows = parseLedgerPayload(data);
    if (!rows) {
      return { ok: false, message: "원장 비교 RPC 응답 형식이 올바르지 않습니다." };
    }

    const records = new Map<string, LedgerRecord>();
    for (const row of rows) {
      if (!row || typeof row !== "object") {
        continue;
      }
      const mapped = mapLedgerRow(row as Record<string, unknown>);
      if (mapped) {
        records.set(mapped.employeeId, mapped);
      }
    }

    return {
      ok: true,
      records,
      fields: FULL_COMPARE_FIELDS,
      source: "ledger",
    };
  } catch {
    return { ok: false, message: "원장 비교 데이터를 불러오지 못했습니다." };
  }
}
