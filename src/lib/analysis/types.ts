export type NamedCount = {
  label: string;
  count: number;
};

export type OrgHeadcount = {
  parentOrg: string;
  total: number;
  faculty: number;
  staff: number;
};

export type AnalysisKpis = {
  total: number;
  faculty: number;
  staff: number;
  leave: number;
  facultyShare: number;
  staffShare: number;
  leaveShare: number;
};

export type AnalysisBreakdown = {
  kpis: AnalysisKpis;
  facultyTypes: NamedCount[];
  facultyGrades: NamedCount[];
  nonTenureTypes: NamedCount[];
  staffEmploymentTypes: NamedCount[];
  staffJobGroups: NamedCount[];
  staffGrades: NamedCount[];
  organizations: OrgHeadcount[];
  insights: {
    facultyShare: string;
    staffShare: string;
    facultyTenure: string;
    staffEmployment: string;
  };
};

export type AppointmentTypeCount = {
  type: string;
  count: number;
};

export type AppointmentRecentRow = {
  appointmentType: string;
  appointmentDate: string;
  employeeId: string;
  name: string;
  department: string;
  parentOrg: string;
  detail: string;
};

export type AppointmentSummary =
  | { ok: true; total: number; types: AppointmentTypeCount[]; recent: AppointmentRecentRow[] }
  | { ok: false; needsRpc: boolean };

export type SnapshotPoint = {
  snapshotDate: string;
  total: number;
  faculty: number | null;
  staff: number | null;
};

export type AnalysisData = {
  asOfDate: string | null;
  selectedOrg: string | null;
  breakdown: AnalysisBreakdown;
  snapshots: SnapshotPoint[];
  appointments: AppointmentSummary;
};
