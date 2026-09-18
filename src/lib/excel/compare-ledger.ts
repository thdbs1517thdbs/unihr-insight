import { FIELD_LABELS } from "./types";
import type {
  ExcelRow,
  FieldChange,
  LedgerField,
  LedgerRecord,
  PreviewItem,
} from "./types";

export function compareWithLedger(options: {
  validRows: ExcelRow[];
  excelIdsInFile: Set<string>;
  dbRecords: Map<string, LedgerRecord>;
  fields: LedgerField[];
}) {
  const created: PreviewItem[] = [];
  const changed: PreviewItem[] = [];
  const retiredCandidates: PreviewItem[] = [];

  for (const row of options.validRows) {
    const current = options.dbRecords.get(row.employeeId);
    if (!current) {
      created.push({
        id: `created-${row.employeeId}`,
        category: "created",
        employeeId: row.employeeId,
        name: row.name,
        department: row.department,
        rowNumber: row.rowNumber,
      });
      continue;
    }

    const changes: FieldChange[] = [];
    for (const field of options.fields) {
      const before = current[field] ?? "";
      const after = row[field] ?? "";
      if (before !== after) {
        changes.push({
          field,
          label: FIELD_LABELS[field],
          before: before || "—",
          after: after || "—",
        });
      }
    }

    if (changes.length > 0) {
      changed.push({
        id: `changed-${row.employeeId}`,
        category: "changed",
        employeeId: row.employeeId,
        name: row.name,
        department: row.department,
        rowNumber: row.rowNumber,
        changes,
      });
    }
  }

  for (const [employeeId, current] of options.dbRecords.entries()) {
    if (options.excelIdsInFile.has(employeeId)) {
      continue;
    }
    retiredCandidates.push({
      id: `retired-${employeeId}`,
      category: "retiredCandidate",
      employeeId,
      name: current.name,
      department: current.department,
      employmentStatus: current.employmentStatus,
    });
  }

  return { created, changed, retiredCandidates };
}
