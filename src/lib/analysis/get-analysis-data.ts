import { createSupabaseClient } from "@/lib/supabase/client";
import { getDataAsOfDate } from "@/lib/employees/get-employee-directory";
import { getLedgerForCompare } from "@/lib/excel/get-ledger-for-compare";
import { buildAnalysisBreakdown } from "./build-analysis";
import type {
  AnalysisData,
  AppointmentRecentRow,
  AppointmentSummary,
  AppointmentTypeCount,
  SnapshotPoint,
} from "./types";

function readText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).replace(/\s+/g, " ").trim();
}

function readCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function parseAppointments(payload: unknown): AppointmentSummary {
  const record = Array.isArray(payload) ? payload[0] : payload;
  if (!record || typeof record !== "object") {
    return { ok: false, needsRpc: true };
  }

  const data = record as Record<string, unknown>;
  if (data.ok === false) {
    return { ok: false, needsRpc: true };
  }

  const typesSource = Array.isArray(data.types) ? data.types : [];
  const recentSource = Array.isArray(data.recent) ? data.recent : [];

  const types: AppointmentTypeCount[] = typesSource.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const row = item as Record<string, unknown>;
    const type = readText(row.type ?? row.appointment_type);
    const count = readCount(row.count);
    if (!type || count <= 0) {
      return [];
    }
    return [{ type, count }];
  });

  const recent: AppointmentRecentRow[] = recentSource.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const row = item as Record<string, unknown>;
    return [
      {
        appointmentType: readText(row.appointment_type ?? row.type),
        appointmentDate: readText(row.appointment_date ?? row.event_date),
        employeeId: readText(row.employee_id),
        name: readText(row.name),
        department: readText(row.department),
        parentOrg: readText(row.parent_organization ?? row.parent_org),
        detail: readText(row.detail ?? row.remarks ?? row.description),
      },
    ];
  });

  const total = types.reduce((sum, item) => sum + item.count, 0);
  return { ok: true, total, types, recent };
}

async function getSnapshots(): Promise<SnapshotPoint[]> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("hr_snapshots")
      .select("snapshot_date, total_employees, faculty_count, staff_count")
      .order("snapshot_date", { ascending: true });

    if (error) {
      return [];
    }

    return (data ?? []).flatMap((row) => {
      const snapshotDate = row.snapshot_date;
      if (typeof snapshotDate !== "string" || snapshotDate.length === 0) {
        return [];
      }
      const total = readCount(row.total_employees);
      return [
        {
          snapshotDate,
          total,
          faculty:
            typeof row.faculty_count === "number" ? row.faculty_count : null,
          staff: typeof row.staff_count === "number" ? row.staff_count : null,
        },
      ];
    });
  } catch {
    return [];
  }
}

async function getAppointments(): Promise<AppointmentSummary> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.rpc("get_recent_appointments");
    if (error) {
      return { ok: false, needsRpc: true };
    }
    return parseAppointments(data);
  } catch {
    return { ok: false, needsRpc: true };
  }
}

export async function getAnalysisData(
  selectedOrg: string | null,
): Promise<{ ok: true; data: AnalysisData } | { ok: false }> {
  try {
    const [ledger, snapshots, asOfDate, appointments] = await Promise.all([
      getLedgerForCompare(),
      getSnapshots(),
      getDataAsOfDate(),
      getAppointments(),
    ]);

    if (!ledger.ok) {
      return { ok: false };
    }

    const records = [...ledger.records.values()];
    const orgNames = new Set(
      records
        .filter((record) => record.employmentStatus !== "퇴직" && record.parentOrg)
        .map((record) => record.parentOrg),
    );
    const orgFilter =
      selectedOrg && orgNames.has(selectedOrg) ? selectedOrg : null;

    return {
      ok: true,
      data: {
        asOfDate,
        selectedOrg: orgFilter,
        breakdown: buildAnalysisBreakdown(records, orgFilter),
        snapshots,
        appointments,
      },
    };
  } catch {
    return { ok: false };
  }
}
