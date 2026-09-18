import type { ReactNode } from "react";
import { formatNumber } from "@/lib/format";

type DataPageHeaderProps = {
  asOfDate: string | null;
  totalCount: number | null;
  uploadSlot: ReactNode;
};

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${year}.${month}.${day}`;
}

export function DataPageHeader({
  asOfDate,
  totalCount,
  uploadSlot,
}: DataPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
            데이터 관리
          </h1>
          <span className="rounded border border-navy-800/20 bg-white px-2.5 py-1 text-xs font-medium tracking-wide text-navy-800">
            DATA
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          교직원 기초자료를 등록·조회하고 인사 원천 데이터를 관리합니다.
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted">현재 데이터 기준일</dt>
            <dd className="tabular font-medium text-navy-900">
              {asOfDate ? formatDate(asOfDate) : "확인 불가"}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">전체 원장 건수</dt>
            <dd className="tabular font-medium text-navy-900">
              {totalCount === null ? "—" : `${formatNumber(totalCount)}건`}
            </dd>
          </div>
        </dl>
      </div>
      {uploadSlot}
    </div>
  );
}
