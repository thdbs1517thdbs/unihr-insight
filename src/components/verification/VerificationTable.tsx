import { formatNumber } from "@/lib/format";
import type { DisclosureRow, VerificationStatus } from "@/lib/verification/types";

const columns = [
  "작성연도",
  "통계 구분",
  "세부 항목",
  "시스템 집계",
  "제출자료",
  "차이",
  "검증 결과",
  "비고",
  "상세보기",
] as const;

const statusClass: Record<VerificationStatus, string> = {
  일치: "bg-slate-100 text-slate-700",
  불일치: "bg-amber-50 text-amber-800",
  "확인 필요": "bg-blue-50 text-blue-800",
};

type VerificationTableProps = {
  rows: DisclosureRow[];
  onOpen: (row: DisclosureRow) => void;
};

function displayCount(value: number | null) {
  return value === null ? "—" : formatNumber(value);
}

function displayDiff(value: number | null) {
  if (value === null) {
    return "—";
  }
  if (value > 0) {
    return `+${formatNumber(value)}`;
  }
  return formatNumber(value);
}

export function VerificationTable({ rows, onOpen }: VerificationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-medium text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-5 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`cursor-pointer border-t border-line hover:bg-slate-50 ${
                row.status === "불일치" ? "bg-amber-50/60" : "bg-white"
              }`}
              onClick={() => onOpen(row)}
            >
              <td className="tabular whitespace-nowrap px-5 py-3 text-slate-700">
                {row.referenceYear || "—"}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                {row.reportCategory || "—"}
              </td>
              <td className="min-w-[10rem] px-5 py-3 text-navy-900">
                {row.detailCategory || "—"}
              </td>
              <td className="tabular whitespace-nowrap px-5 py-3 text-slate-700">
                {displayCount(row.sourceCount)}
              </td>
              <td className="tabular whitespace-nowrap px-5 py-3 text-slate-700">
                {displayCount(row.reportedCount)}
              </td>
              <td className="tabular whitespace-nowrap px-5 py-3 text-slate-700">
                {displayDiff(row.difference)}
              </td>
              <td className="whitespace-nowrap px-5 py-3">
                <span
                  className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${statusClass[row.status]}`}
                >
                  {row.status}
                </span>
              </td>
              <td className="min-w-[12rem] px-5 py-3 text-slate-600">
                {row.remarks || "—"}
              </td>
              <td className="whitespace-nowrap px-5 py-3">
                <button
                  type="button"
                  className="text-sm font-medium text-navy-800 hover:underline"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(row);
                  }}
                >
                  상세보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VerificationEmpty() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-medium text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-5 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
      </table>
      <p className="px-5 py-8 text-center text-sm text-slate-600">
        조회 조건에 해당하는 검증 항목이 없습니다.
      </p>
    </div>
  );
}
