import type { ExcelRow } from "@/lib/excel/types";

export function uniqueReferenceDate(validRows: ExcelRow[]) {
  const dates = new Set(
    validRows.map((row) => row.asOfDate).filter((value) => value !== ""),
  );

  if (dates.size === 0) {
    return {
      ok: false as const,
      message:
        "유효한 기준일이 없어 적용을 중단했습니다. 원장 데이터는 변경되지 않았습니다.",
    };
  }

  if (dates.size > 1) {
    return {
      ok: false as const,
      message:
        "파일 안의 기준일이 서로 달라 적용을 중단했습니다. 원장 데이터는 변경되지 않았습니다.",
    };
  }

  const [referenceDate] = dates;
  return { ok: true as const, referenceDate };
}
