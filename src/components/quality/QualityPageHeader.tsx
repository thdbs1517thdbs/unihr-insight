type QualityPageHeaderProps = {
  asOfDate: string | null;
};

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${year}.${month}.${day}`;
}

export function QualityPageHeader({ asOfDate }: QualityPageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          데이터 품질관리
        </h1>
        <span className="rounded border border-navy-800/20 bg-white px-2.5 py-1 text-xs font-medium tracking-wide text-navy-800">
          CHECK
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        인사원장의 누락·중복·날짜 및 분류값 오류를 자동 점검합니다.
      </p>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-muted">현재 점검 기준일</dt>
          <dd className="tabular font-medium text-navy-900">
            {asOfDate ? formatDate(asOfDate) : "확인 불가"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
