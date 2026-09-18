const STEPS = [
  "집계 데이터",
  "개인정보 제외",
  "생성형 AI 문장화",
  "담당자 검토",
  "최종 보고",
] as const;

export function ReportProcessSteps() {
  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-navy-900">보고서 생성 절차</h2>
      <p className="mt-1 text-xs text-muted">
        생성형 AI는 계산기가 아니라, 검증된 통계를 보고서 문장으로 변환하는
        도구입니다.
      </p>
      <ol className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-2">
            <span className="rounded-md bg-slate-50 px-3 py-2 text-navy-900">
              {step}
            </span>
            {index < STEPS.length - 1 ? (
              <span className="text-slate-300" aria-hidden>
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
