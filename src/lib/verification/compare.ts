import type { VerificationStatus } from "./types";

export function readCount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
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

export function compareCounts(
  sourceCount: number | null,
  reportedCount: number | null,
): VerificationStatus {
  if (sourceCount === null || reportedCount === null) {
    return "확인 필요";
  }
  if (sourceCount === reportedCount) {
    return "일치";
  }
  return "불일치";
}

export function diffCounts(
  sourceCount: number | null,
  reportedCount: number | null,
): number | null {
  if (sourceCount === null || reportedCount === null) {
    return null;
  }
  return reportedCount - sourceCount;
}

export function formatMatchRate(matched: number, total: number) {
  if (!Number.isFinite(matched) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return Number(((matched / total) * 100).toFixed(1));
}
