import { formatNumber } from "@/lib/format";
import type { OrgHeadcount } from "@/lib/analysis/types";

type OrganizationPanelProps = {
  organizations: OrgHeadcount[];
  selectedOrg: string | null;
};

function hrefForOrg(org: string | null) {
  if (!org) {
    return "/analysis";
  }
  return `/analysis?org=${encodeURIComponent(org)}`;
}

export function OrganizationPanel({
  organizations,
  selectedOrg,
}: OrganizationPanelProps) {
  const max = Math.max(...organizations.map((item) => item.total), 1);

  return (
    <section className="mb-6 rounded-lg border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold text-navy-900">
          조직별 인력 현황
        </h2>
        <p className="mt-1 text-xs text-muted">
          상위조직 기준 현재 현원입니다. 조직을 선택하면 위 구성 분석을 해당
          조직으로 좁힙니다.
        </p>
        {selectedOrg ? (
          <p className="mt-2 text-xs">
            <a href="/analysis" className="font-medium text-navy-800 hover:underline">
              대학 전체로 돌아가기
            </a>
          </p>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">상위조직</th>
              <th className="px-5 py-3 font-medium">전체</th>
              <th className="px-5 py-3 font-medium">교원</th>
              <th className="px-5 py-3 font-medium">직원</th>
              <th className="min-w-[10rem] px-5 py-3 font-medium">규모</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => {
              const selected = selectedOrg === org.parentOrg;
              return (
                <tr
                  key={org.parentOrg}
                  className={`border-t border-line ${
                    selected ? "bg-slate-50" : "bg-white"
                  }`}
                >
                  <td className="whitespace-nowrap px-5 py-3">
                    <a
                      href={hrefForOrg(selected ? null : org.parentOrg)}
                      className="font-medium text-navy-800 hover:underline"
                    >
                      {org.parentOrg}
                    </a>
                  </td>
                  <td className="tabular whitespace-nowrap px-5 py-3 text-navy-900">
                    {formatNumber(org.total)}
                  </td>
                  <td className="tabular whitespace-nowrap px-5 py-3 text-slate-600">
                    {formatNumber(org.faculty)}
                  </td>
                  <td className="tabular whitespace-nowrap px-5 py-3 text-slate-600">
                    {formatNumber(org.staff)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-2 overflow-hidden rounded bg-slate-100">
                      <div
                        className="h-full rounded bg-navy-800"
                        style={{ width: `${(org.total / max) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
