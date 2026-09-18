import type { Metadata } from "next";
import { DataLoadError } from "@/components/dashboard/DataLoadError";
import { QualityIssueList } from "@/components/quality/QualityIssueList";
import { QualityPageHeader } from "@/components/quality/QualityPageHeader";
import { QualitySearchForm } from "@/components/quality/QualitySearchForm";
import { QualitySummaryCards } from "@/components/quality/QualitySummaryCards";
import { QualityTypeCards } from "@/components/quality/QualityTypeCards";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  filterQualityIssues,
  paginateQualityIssues,
  readIssueTypeFilter,
  readReviewStatusFilter,
} from "@/lib/quality/filter-issues";
import { getQualityReport } from "@/lib/quality/get-quality-report";
import { formatNumber } from "@/lib/format";
import type { QualityFilters } from "@/lib/quality/types";

export const metadata: Metadata = {
  title: "데이터 품질관리",
};

export const dynamic = "force-dynamic";

function readParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function readPage(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function QualityPage({
  searchParams,
}: {
  searchParams: Promise<{
    employeeNo?: string | string[];
    name?: string | string[];
    department?: string | string[];
    issueType?: string | string[];
    reviewStatus?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const filters: QualityFilters = {
    employeeNo: readParam(params.employeeNo),
    name: readParam(params.name),
    department: readParam(params.department),
    issueType: readIssueTypeFilter(readParam(params.issueType)),
    reviewStatus: readReviewStatusFilter(readParam(params.reviewStatus)),
    page: readPage(readParam(params.page)),
  };

  const [report, admin] = await Promise.all([
    getQualityReport(),
    requireAdmin(),
  ]);

  if (!report.ok) {
    return (
      <>
        <QualityPageHeader asOfDate={null} />
        <DataLoadError title="인사원장 품질 점검 데이터를 불러오지 못했습니다." />
      </>
    );
  }

  const filtered = filterQualityIssues(report.issues, filters);
  const paged = paginateQualityIssues(filtered, filters.page);
  const listFilters = { ...filters, page: paged.page };

  return (
    <>
      <QualityPageHeader asOfDate={report.asOfDate} />
      <QualitySummaryCards summary={report.summary} />
      <QualityTypeCards
        filters={listFilters}
        typeCounts={report.summary.typeCounts}
      />

      <section className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-navy-900">문제 목록</h2>
          <p className="mt-1 text-xs text-muted">
            문제가 없는 교직원은 이 목록에 표시하지 않습니다. 현재 목록은 문제{" "}
            {formatNumber(paged.totalCount)}건입니다. 처리 상태는 품질 이슈의
            검토 상태이며 인사원장 데이터 자체를 변경하지 않습니다.
          </p>
        </div>

        <QualitySearchForm filters={listFilters} />

        <QualityIssueList
          rows={paged.rows}
          filters={listFilters}
          totalCount={paged.totalCount}
          canManage={admin.ok}
        />
      </section>
    </>
  );
}
