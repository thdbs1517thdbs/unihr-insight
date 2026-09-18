import { REQUIRED_COLUMNS } from "./types";
import type { ExcelRow, PreviewItem } from "./types";

type ParsedRow = ExcelRow & { dateErrors?: string[] };

const CATEGORY_VALUES = new Set(["교원", "직원"]);
const STATUS_VALUES = new Set(["재직", "휴직", "퇴직"]);

export function validateExcelRows(rows: ParsedRow[]) {
  const errors: PreviewItem[] = [];
  const validRows: ExcelRow[] = [];
  const idCounts = new Map<string, number>();

  for (const row of rows) {
    if (row.employeeId) {
      idCounts.set(row.employeeId, (idCounts.get(row.employeeId) ?? 0) + 1);
    }
  }

  for (const row of rows) {
    const messages: string[] = [];

    if (!row.employeeId) {
      messages.push("필수값 누락: 교직원번호");
    }
    if (!row.name) {
      messages.push("필수값 누락: 성명");
    }
    if (!row.employeeCategory) {
      messages.push("필수값 누락: 교직원구분");
    } else if (!CATEGORY_VALUES.has(row.employeeCategory)) {
      messages.push("교직원구분은 교원 또는 직원이어야 합니다.");
    }
    if (!row.employmentStatus) {
      messages.push("필수값 누락: 재직상태");
    } else if (!STATUS_VALUES.has(row.employmentStatus)) {
      messages.push("재직상태는 재직, 휴직, 퇴직 중 하나여야 합니다.");
    }
    if (row.dateErrors?.length) {
      messages.push(`날짜 형식이 올바르지 않습니다: ${row.dateErrors.join(", ")}`);
    }
    if (row.employeeId && (idCounts.get(row.employeeId) ?? 0) > 1) {
      messages.push("파일 내 교직원번호가 중복되었습니다.");
    }

    if (messages.length > 0) {
      errors.push({
        id: `error-${row.rowNumber}-${row.employeeId || "empty"}`,
        category: "error",
        employeeId: row.employeeId,
        name: row.name,
        department: row.department,
        rowNumber: row.rowNumber,
        messages,
      });
      continue;
    }

    const { dateErrors: _unused, ...cleanRow } = row;
    void _unused;
    validRows.push(cleanRow);
  }

  return { validRows, errors };
}

export { REQUIRED_COLUMNS };
