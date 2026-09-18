import { formatDateLabel } from "@/lib/analysis/format";

type ReportPageHeaderProps = {
  asOfDate: string | null;
};

export function ReportPageHeader({ asOfDate }: ReportPageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          AI 인사보고서
        </h1>
        <span className="rounded border border-navy-800/20 bg-white px-2.5 py-1 text-xs font-medium tracking-wide text-navy-800">
          REPORT
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        검증된 인사통계 데이터를 바탕으로 보고서 초안을 생성합니다.
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        인사 데이터를 수집·검증한 뒤, 정확한 집계 결과만 생성형 AI에 전달하여
        반복적인 보고서 초안 작성 업무를 지원합니다. 생성형 AI는 숫자를 계산하지
        않고, 검증된 통계를 행정 보고서 문장으로 바꿉니다.
      </p>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-muted">보고서 기준일</dt>
          <dd className="tabular font-medium text-navy-900">
            {asOfDate ? formatDateLabel(asOfDate) : "확인 불가"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
