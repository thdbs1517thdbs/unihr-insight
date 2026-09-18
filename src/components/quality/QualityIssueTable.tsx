import { QualityStatusBadge } from "@/components/quality/QualityStatusBadge";
import {
  QUALITY_ISSUE_TYPE_LABELS,
  type QualityIssue,
} from "@/lib/quality/types";

const columns = [
  "교직원번호",
  "성명",
  "문제 유형",
  "문제 필드",
  "문제 내용",
  "현재 값",
  "처리상태",
  "상세보기",
] as const;

type QualityIssueTableProps = {
  rows: QualityIssue[];
  onOpen: (issue: QualityIssue) => void;
};

export function QualityIssueTable({ rows, onOpen }: QualityIssueTableProps) {
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
              className="cursor-pointer border-t border-line hover:bg-slate-50"
              onClick={() => onOpen(row)}
            >
              <td className="tabular whitespace-nowrap px-5 py-3 text-slate-700">
                {row.employeeId || "—"}
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-medium text-navy-900">
                {row.name || "—"}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {QUALITY_ISSUE_TYPE_LABELS[row.issueType]}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {row.fieldLabel}
              </td>
              <td className="min-w-[16rem] px-5 py-3 text-slate-700">
                {row.message}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {row.currentValue}
              </td>
              <td className="whitespace-nowrap px-5 py-3">
                <QualityStatusBadge status={row.reviewStatus} />
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

export function QualityIssueEmpty() {
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
        조회 조건에 해당하는 품질 문제가 없습니다.
      </p>
    </div>
  );
}
