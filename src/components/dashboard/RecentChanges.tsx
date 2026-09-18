import { recentChanges } from "@/lib/mock-data";

const typeClass: Record<string, string> = {
  승진: "bg-navy-800 text-white",
  전보: "bg-slate-100 text-navy-800",
  신규임용: "bg-blue-50 text-blue-800",
  휴직: "bg-amber-50 text-amber-800",
  퇴직: "bg-slate-200 text-slate-700",
};

export function RecentChanges() {
  return (
    <section className="rounded-lg border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold text-navy-900">최근 인사 변동</h2>
        <p className="mt-1 text-xs text-muted">최근 처리된 발령 내역 (임시 데이터)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">발령일</th>
              <th className="px-5 py-3 font-medium">구분</th>
              <th className="px-5 py-3 font-medium">성명</th>
              <th className="px-5 py-3 font-medium">소속</th>
              <th className="px-5 py-3 font-medium">내용</th>
            </tr>
          </thead>
          <tbody>
            {recentChanges.map((row) => (
              <tr key={`${row.date}-${row.name}`} className="border-t border-line">
                <td className="tabular whitespace-nowrap px-5 py-3 text-slate-700">
                  {row.date}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${typeClass[row.type] ?? "bg-slate-100"}`}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="px-5 py-3 font-medium text-navy-900">{row.name}</td>
                <td className="px-5 py-3 text-slate-600">{row.affiliation}</td>
                <td className="px-5 py-3 text-slate-600">{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
