type VerificationPageHeaderProps = {
  universityName: string;
  referenceYears: string[];
};

export function VerificationPageHeader({
  universityName,
  referenceYears,
}: VerificationPageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          통계자료 검증
        </h1>
        <span className="rounded border border-navy-800/20 bg-white px-2.5 py-1 text-xs font-medium tracking-wide text-navy-800">
          VERIFY
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        시스템 집계와 제출자료를 비교하여 불일치 항목을 확인합니다.
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        이 화면은 {universityName || "한국대학교"}의 대학정보공시 작성자료 검증용
        synthetic dataset을 사용합니다. 실제 대학정보공시 공식 서식이나 제출
        자료가 아닙니다. 숫자는 시스템 집계와 제출자료를 그대로 대조합니다.
      </p>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-muted">작성연도</dt>
          <dd className="tabular font-medium text-navy-900">
            {referenceYears.length > 0 ? referenceYears.join(", ") : "확인 불가"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
