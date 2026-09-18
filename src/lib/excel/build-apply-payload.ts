import {
  emptyToNull,
  excelRowToCreatedPayload,
  LEDGER_FIELD_TO_DB_COLUMN,
} from "@/lib/excel/db-field-map";
import type { ExcelRow, PreviewItem } from "@/lib/excel/types";

export type ChangedPayloadItem = {
  employee_id: string;
  changes: Record<string, string | null>;
};

export type ApplyRpcPayload = {
  p_file_name: string;
  p_reference_date: string;
  p_total_rows: number;
  p_error_rows: number;
  p_created: Record<string, string | null>[];
  p_changed: ChangedPayloadItem[];
  p_retired_ids: string[];
};

export function buildApplyPayload(options: {
  fileName: string;
  referenceDate: string;
  totalRows: number;
  errorRows: number;
  validRows: ExcelRow[];
  createdItems: PreviewItem[];
  changedItems: PreviewItem[];
  retiredIds: string[];
}): ApplyRpcPayload {
  const validById = new Map(options.validRows.map((row) => [row.employeeId, row]));

  const p_created = options.createdItems.map((item) => {
    const row = validById.get(item.employeeId);
    if (!row) {
      throw new Error("신규 승인 행을 서버 재검증 결과에서 찾지 못했습니다.");
    }
    return excelRowToCreatedPayload(row);
  });

  const p_changed: ChangedPayloadItem[] = options.changedItems.map((item) => {
    const row = validById.get(item.employeeId);
    if (!row || !item.changes?.length) {
      throw new Error("변경 승인 행을 서버 재검증 결과에서 찾지 못했습니다.");
    }

    const changes: Record<string, string | null> = {};
    for (const change of item.changes) {
      const column = LEDGER_FIELD_TO_DB_COLUMN[change.field];
      changes[column] = emptyToNull(row[change.field]);
    }

    return {
      employee_id: item.employeeId,
      changes,
    };
  });

  return {
    p_file_name: options.fileName,
    p_reference_date: options.referenceDate,
    p_total_rows: options.totalRows,
    p_error_rows: options.errorRows,
    p_created,
    p_changed,
    p_retired_ids: options.retiredIds,
  };
}
