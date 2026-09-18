export const VERIFICATION_PAGE_SIZE = 20;

export const VERIFICATION_STATUSES = ["일치", "불일치", "확인 필요"] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const VERIFICATION_STATUS_OPTIONS = [
  "전체",
  ...VERIFICATION_STATUSES,
] as const;

export type VerificationStatusFilter =
  (typeof VERIFICATION_STATUS_OPTIONS)[number];

export type DisclosureRow = {
  id: string;
  referenceYear: string;
  universityName: string;
  reportCategory: string;
  detailCategory: string;
  sourceCount: number | null;
  reportedCount: number | null;
  difference: number | null;
  sourceDataset: string;
  remarks: string;
  storedResult: string;
  status: VerificationStatus;
};

export type CategorySummary = {
  reportCategory: string;
  total: number;
  matched: number;
  mismatched: number;
  pending: number;
};

export type VerificationKpis = {
  total: number;
  matched: number;
  mismatched: number;
  pending: number;
  matchRate: number;
};

export type VerificationFilters = {
  category: string;
  detail: string;
  status: VerificationStatusFilter;
  page: number;
};

export type VerificationData = {
  universityName: string;
  referenceYears: string[];
  kpis: VerificationKpis;
  categories: CategorySummary[];
  rows: DisclosureRow[];
};
