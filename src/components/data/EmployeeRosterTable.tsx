import type { EmployeeDirectoryRow } from "@/lib/employees/types";

const columns = [
  "교직원번호",
  "성명",
  "교직원구분",
  "상위조직",
  "소속부서",
  "직군",
  "직급",
  "고용형태",
  "재직상태",
] as const;

const statusClass: Record<string, string> = {
  재직: "bg-navy-800 text-white",
  휴직: "bg-amber-50 text-amber-800",
  퇴직: "bg-slate-100 text-slate-600",
};

type EmployeeRosterTableProps = {
  rows: EmployeeDirectoryRow[];
};

export function EmployeeRosterTable({ rows }: EmployeeRosterTableProps) {
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
            <tr key={row.employeeNo} className="border-t border-line">
              <td className="tabular whitespace-nowrap px-5 py-3 text-slate-700">
                {row.employeeNo}
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-medium text-navy-900">
                {row.name}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {row.employeeCategory}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {row.parentOrg}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {row.department}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {row.jobGroup}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {row.jobGrade}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {row.employmentType}
              </td>
              <td className="whitespace-nowrap px-5 py-3">
                <span
                  className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                    statusClass[row.employmentStatus] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {row.employmentStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmployeeRosterEmpty() {
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
        조회 조건에 해당하는 교직원이 없습니다.
      </p>
    </div>
  );
}
