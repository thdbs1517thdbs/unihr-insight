import { CompositionPanel } from "@/components/dashboard/CompositionPanel";
import { DataLoadError } from "@/components/dashboard/DataLoadError";
import { QualityStatusPanel } from "@/components/dashboard/QualityStatusPanel";
import { RecentChanges } from "@/components/dashboard/RecentChanges";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendPanel } from "@/components/dashboard/TrendPanel";
import { VerifyStatusPanel } from "@/components/dashboard/VerifyStatusPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
import { WORKFLOW_STEPS } from "@/lib/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const result = await getDashboardData();

  return (
    <>
      <PageHeader
        title="홈"
        description="대학 인사 현황을 한눈에 확인하고 업무 흐름을 시작합니다. 2026.09.01 기준"
      />

      <section className="mb-6 rounded-lg border border-line bg-white px-5 py-4">
        <p className="text-xs font-medium tracking-wide text-muted">업무 흐름</p>
        <ol className="mt-2 flex flex-wrap items-center gap-2 text-sm text-navy-900">
          {WORKFLOW_STEPS.map((step, index) => (
            <li key={step.key} className="flex items-center gap-2">
              <span>
                <span className="font-semibold tracking-wide">{step.key}</span>
                <span className="ml-1 text-muted">{step.label}</span>
              </span>
              {index < WORKFLOW_STEPS.length - 1 ? (
                <span className="text-slate-300" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {result.ok ? (
        <>
          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="전체 교직원"
              value={result.data.kpis.total}
              unit="명"
              note="재직상태 퇴직 제외"
              tone="navy"
            />
            <StatCard
              label="교원"
              value={result.data.kpis.faculty}
              unit="명"
              note="퇴직 제외 · 교원"
              tone="blue"
            />
            <StatCard
              label="직원"
              value={result.data.kpis.staff}
              unit="명"
              note="퇴직 제외 · 직원"
              tone="slate"
            />
            <StatCard
              label="휴직"
              value={result.data.kpis.leave}
              unit="명"
              note="재직상태 휴직"
              tone="amber"
            />
          </section>

          <div className="mb-6">
            <RecentChanges />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <CompositionPanel
              items={[
                {
                  label: "교원",
                  count: result.data.kpis.faculty,
                  color: "#1b3a63",
                },
                {
                  label: "직원",
                  count: result.data.kpis.staff,
                  color: "#64748b",
                },
                ...(result.data.kpis.total -
                  result.data.kpis.faculty -
                  result.data.kpis.staff >
                0
                  ? [
                      {
                        label: "기타",
                        count:
                          result.data.kpis.total -
                          result.data.kpis.faculty -
                          result.data.kpis.staff,
                        color: "#94a3b8",
                      },
                    ]
                  : []),
              ]}
            />
            <TrendPanel snapshots={result.data.snapshots} />
          </div>
        </>
      ) : (
        <div className="mb-6">
          <DataLoadError />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <QualityStatusPanel />
        <VerifyStatusPanel />
      </div>
    </>
  );
}
