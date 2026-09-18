import { createSupabaseClient } from "@/lib/supabase/client";
import type { DashboardData, DashboardResult, SnapshotTrend } from "./types";

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

function parseSummary(payload: unknown) {
  const row = Array.isArray(payload) ? payload[0] : payload;
  if (!row || typeof row !== "object") {
    return null;
  }

  const record = row as Record<string, unknown>;
  const total = readNumber(record.total_employees);
  const faculty = readNumber(record.faculty_count);
  const staff = readNumber(record.staff_count);
  const leave = readNumber(record.leave_count);

  if (total === null || faculty === null || staff === null || leave === null) {
    return null;
  }

  return { total, faculty, staff, leave };
}

function mapSnapshot(row: Record<string, unknown>): SnapshotTrend | null {
  const snapshotDate = row.snapshot_date;
  if (typeof snapshotDate !== "string" || snapshotDate.length === 0) {
    return null;
  }

  const total = readNumber(row.total_employees);
  if (total === null) {
    return null;
  }

  return {
    snapshotDate,
    total,
    faculty: readNumber(row.faculty_count),
    staff: readNumber(row.staff_count),
  };
}

export async function getDashboardData(): Promise<DashboardResult> {
  try {
    const supabase = createSupabaseClient();

    const [summaryResult, snapshotResult] = await Promise.all([
      supabase.rpc("get_dashboard_summary"),
      supabase
        .from("hr_snapshots")
        .select("snapshot_date, total_employees, faculty_count, staff_count")
        .order("snapshot_date", { ascending: true }),
    ]);

    if (summaryResult.error || snapshotResult.error) {
      return { ok: false };
    }

    const kpis = parseSummary(summaryResult.data);
    if (!kpis) {
      return { ok: false };
    }

    const snapshots = (snapshotResult.data ?? [])
      .map((row) => mapSnapshot(row as Record<string, unknown>))
      .filter((row): row is SnapshotTrend => row !== null);

    if ((snapshotResult.data ?? []).length > 0 && snapshots.length === 0) {
      return { ok: false };
    }

    const data: DashboardData = {
      kpis,
      snapshots,
    };

    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}
