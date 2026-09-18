import type { Metadata } from "next";
import { DataLoadError } from "@/components/dashboard/DataLoadError";
import { VerificationKpiCards } from "@/components/verification/VerificationKpiCards";
import { VerificationList } from "@/components/verification/VerificationList";
import { VerificationPageHeader } from "@/components/verification/VerificationPageHeader";
import { VerificationSearchForm } from "@/components/verification/VerificationSearchForm";
import { VerificationSummary } from "@/components/verification/VerificationSummary";
import { formatNumber } from "@/lib/format";
import {
  filterVerificationRows,
  paginateVerificationRows,
  readStatusFilter,
} from "@/lib/verification/filter-rows";
import { getVerificationData } from "@/lib/verification/get-verification-data";
import type { VerificationFilters } from "@/lib/verification/types";

export const metadata: Metadata = {
  title: "통계자료 검증",
};

export const dynamic = "force-dynamic";

function readParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function readPage(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string | string[];
    detail?: string | string[];
    status?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const filters: VerificationFilters = {
    category: readParam(params.category),
    detail: readParam(params.detail),
    status: readStatusFilter(readParam(params.status)),
    page: readPage(readParam(params.page)),
  };

  const result = await getVerificationData();

  if (!result.ok) {
    return (
      <>
        <VerificationPageHeader universityName="한국대학교" referenceYears={[]} />
        <DataLoadError title="통계자료 검증 데이터를 불러오지 못했습니다. 읽기 전용 RPC 설치가 필요합니다." />
      </>
    );
  }

  const filtered = filterVerificationRows(result.data.rows, filters);
  const paged = paginateVerificationRows(filtered, filters.page);
  const listFilters = { ...filters, page: paged.page };

  return (
    <>
      <VerificationPageHeader
        universityName={result.data.universityName}
        referenceYears={result.data.referenceYears}
      />
      <VerificationKpiCards kpis={result.data.kpis} />
      <VerificationSummary
        kpis={result.data.kpis}
        categories={result.data.categories}
      />

      <section className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-navy-900">검증 항목 목록</h2>
          <p className="mt-1 text-xs text-muted">
            현재 목록은 {formatNumber(paged.totalCount)}건입니다. 불일치 행은 배경색으로
            구분합니다.
          </p>
        </div>
        <VerificationSearchForm filters={listFilters} />
        <VerificationList
          rows={paged.rows}
          filters={listFilters}
          totalCount={paged.totalCount}
        />
      </section>
    </>
  );
}
