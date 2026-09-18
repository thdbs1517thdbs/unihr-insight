import { createSupabaseClient } from "@/lib/supabase/client";
import {
  EMPLOYEE_PAGE_SIZE,
  type EmployeeDirectoryFilters,
  type EmployeeDirectoryResult,
  type EmployeeDirectoryRow,
} from "./types";

function readText(value: unknown) {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return "";
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function mapRow(row: Record<string, unknown>): EmployeeDirectoryRow {
  return {
    employeeNo: readText(row.employee_no),
    name: readText(row.employee_name ?? row.name),
    employeeCategory: readText(row.employee_category),
    parentOrg: readText(row.parent_org),
    department: readText(row.department),
    jobGroup: readText(row.job_group),
    jobGrade: readText(row.job_grade),
    employmentType: readText(row.employment_type),
    employmentStatus: readText(row.employment_status),
  };
}

function parsePayload(
  payload: unknown,
  page: number,
): EmployeeDirectoryResult {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;
    const rowsSource = Array.isArray(record.rows) ? record.rows : [];
    const totalCount = readNumber(record.total_count);
    if (totalCount === null) {
      return { ok: false };
    }

    return {
      ok: true,
      data: {
        rows: rowsSource.map((row) => mapRow(row as Record<string, unknown>)),
        totalCount,
        page,
        pageSize: EMPLOYEE_PAGE_SIZE,
      },
    };
  }

  if (Array.isArray(payload)) {
    const rows = payload.map((row) => mapRow(row as Record<string, unknown>));
    const totalCount =
      readNumber((payload[0] as Record<string, unknown> | undefined)?.total_count) ??
      rows.length;

    return {
      ok: true,
      data: {
        rows,
        totalCount,
        page,
        pageSize: EMPLOYEE_PAGE_SIZE,
      },
    };
  }

  return { ok: false };
}

export async function getEmployeeDirectory(
  filters: EmployeeDirectoryFilters,
): Promise<EmployeeDirectoryResult> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.rpc("get_employee_directory", {
      p_employee_no: filters.employeeNo || null,
      p_name: filters.name || null,
      p_department: filters.department || null,
      p_category: filters.category === "전체" ? null : filters.category,
      p_status: filters.status === "전체" ? null : filters.status,
      p_page: filters.page,
      p_page_size: EMPLOYEE_PAGE_SIZE,
    });

    if (error) {
      return { ok: false };
    }

    return parsePayload(data, filters.page);
  } catch {
    return { ok: false };
  }
}

export async function getDataAsOfDate(): Promise<string | null> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("hr_snapshots")
      .select("snapshot_date")
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || typeof data?.snapshot_date !== "string") {
      return null;
    }

    return data.snapshot_date;
  } catch {
    return null;
  }
}
