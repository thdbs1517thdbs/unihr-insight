import { formatDateLabel } from "@/lib/analysis/format";
import { formatNumber } from "@/lib/format";
import type { AppointmentSummary } from "@/lib/analysis/types";

type AppointmentPanelProps = {
  appointments: AppointmentSummary;
};

export function AppointmentPanel({ appointments }: AppointmentPanelProps) {
  return (
    <section className="rounded-lg border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold text-navy-900">최근 인사변동</h2>
        <p className="mt-1 text-xs text-muted">
          appointment_history 읽기 전용 집계입니다. 예측이나 판단은 포함하지
          않습니다.
        </p>
      </div>
      {!appointments.ok ? (
        <p className="px-5 py-8 text-sm text-slate-600">
          인사발령 현황을 보려면 읽기 전용 RPC 설치가 필요합니다. 현재 권한으로는
          appointment_history를 직접 조회하지 않습니다.
        </p>
      ) : (
        <>
          <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-md border border-line px-3 py-3">
              <p className="text-xs text-muted">최근 발령 건수</p>
              <p className="mt-1 tabular text-lg font-semibold text-navy-900">
                {formatNumber(appointments.total)}건
              </p>
            </article>
            {appointments.types.map((item) => (
              <article
                key={item.type}
                className="rounded-md border border-line px-3 py-3"
              >
                <p className="text-xs text-muted">{item.type}</p>
                <p className="mt-1 tabular text-lg font-semibold text-navy-900">
                  {formatNumber(item.count)}건
                </p>
              </article>
            ))}
          </div>
          <div className="overflow-x-auto border-t border-line">
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
                {appointments.recent.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-sm text-slate-600"
                    >
                      표시할 최근 발령 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  appointments.recent.map((row, index) => (
                    <tr
                      key={`${row.employeeId}-${row.appointmentDate}-${index}`}
                      className="border-t border-line"
                    >
                      <td className="tabular whitespace-nowrap px-5 py-3 text-slate-700">
                        {row.appointmentDate
                          ? formatDateLabel(row.appointmentDate)
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                        {row.appointmentType || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-navy-900">
                        {row.name || row.employeeId || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                        {row.department || row.parentOrg || "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {row.detail || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
