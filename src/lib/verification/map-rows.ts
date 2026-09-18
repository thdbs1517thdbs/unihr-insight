import type { DisclosureRow } from "./types";
import { compareCounts, diffCounts, readCount } from "./compare";

function readText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).replace(/\s+/g, " ").trim();
}

function rowId(row: Record<string, unknown>, index: number) {
  const id = readText(row.id);
  if (id) {
    return id;
  }
  return [
    readText(row.reference_year),
    readText(row.report_category),
    readText(row.detail_category),
    String(index),
  ].join("|");
}

export function mapDisclosureRow(
  row: Record<string, unknown>,
  index: number,
): DisclosureRow {
  const sourceCount = readCount(row.source_count);
  const reportedCount = readCount(row.reported_count);

  return {
    id: rowId(row, index),
    referenceYear: readText(row.reference_year),
    universityName: readText(row.university_name),
    reportCategory: readText(row.report_category),
    detailCategory: readText(row.detail_category),
    sourceCount,
    reportedCount,
    difference: diffCounts(sourceCount, reportedCount),
    sourceDataset: readText(row.source_dataset),
    remarks: readText(row.remarks),
    storedResult: readText(row.verification_result),
    status: compareCounts(sourceCount, reportedCount),
  };
}

export function parseDisclosurePayload(payload: unknown) {
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
