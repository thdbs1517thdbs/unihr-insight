export type DashboardKpis = {
  total: number;
  faculty: number;
  staff: number;
  leave: number;
};

export type SnapshotTrend = {
  snapshotDate: string;
  total: number;
  faculty: number | null;
  staff: number | null;
};

export type DashboardData = {
  kpis: DashboardKpis;
  snapshots: SnapshotTrend[];
};

export type DashboardResult =
  | { ok: true; data: DashboardData }
  | { ok: false };
