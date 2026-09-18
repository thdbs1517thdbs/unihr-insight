import { compareWithLedger } from "@/lib/excel/compare-ledger";
import { getLedgerForCompare } from "@/lib/excel/get-ledger-for-compare";
import { parseHrWorkbook } from "@/lib/excel/parse-workbook";
import { validateExcelRows } from "@/lib/excel/validate-rows";
import type { ExcelRow, PreviewItem, UploadPreviewResult } from "@/lib/excel/types";

export const MAX_EXCEL_FILE_BYTES = 10 * 1024 * 1024;

export type AnalyzedHrExcel =
  | { ok: false; message: string }
  | {
      ok: true;
      fileName: string;
      rows: ExcelRow[];
      validRows: ExcelRow[];
      errors: PreviewItem[];
      preview: Extract<UploadPreviewResult, { ok: true }>;
    };

export function validateExcelFileMeta(file: File) {
  const fileName = file.name;
  if (!fileName.toLowerCase().endsWith(".xlsx")) {
    return {
      ok: false as const,
      message: ".xlsx 형식의 파일만 업로드할 수 있습니다.",
    };
  }
  if (file.size > MAX_EXCEL_FILE_BYTES) {
    return {
      ok: false as const,
      message: "파일 크기가 너무 큽니다. 10MB 이하로 업로드해 주세요.",
    };
  }
  return { ok: true as const, fileName };
}

export async function analyzeHrExcel(
  buffer: Buffer,
  fileName: string,
): Promise<AnalyzedHrExcel> {
  const parsed = await parseHrWorkbook(buffer);
  if (!parsed.ok) {
    return parsed;
  }

  const { validRows, errors } = validateExcelRows(parsed.rows);
  const excelIdsInFile = new Set(
    parsed.rows.map((row) => row.employeeId).filter(Boolean),
  );

  const ledger = await getLedgerForCompare();
  if (!ledger.ok) {
    return {
      ok: true,
      fileName,
      rows: parsed.rows,
      validRows,
      errors,
      preview: {
        ok: true,
        fileName,
        uploadedCount: parsed.rows.length,
        compareSource: "none",
        created: [],
        changed: [],
        retiredCandidates: [],
        errors,
      },
    };
  }

  const compared = compareWithLedger({
    validRows,
    excelIdsInFile,
    dbRecords: ledger.records,
    fields: ledger.fields,
  });

  return {
    ok: true,
    fileName,
    rows: parsed.rows,
    validRows,
    errors,
    preview: {
      ok: true,
      fileName,
      uploadedCount: parsed.rows.length,
      compareSource: ledger.source,
      created: compared.created,
      changed: compared.changed,
      retiredCandidates: compared.retiredCandidates,
      errors,
    },
  };
}
