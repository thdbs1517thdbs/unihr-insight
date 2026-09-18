import type { Metadata } from "next";
import { DataManagementClient } from "@/components/data/DataManagementClient";
import { EmployeePagination } from "@/components/data/EmployeePagination";
import { EmployeeSearchForm } from "@/components/data/EmployeeSearchForm";
import {
  EmployeeRosterEmpty,
  EmployeeRosterTable,
} from "@/components/data/EmployeeRosterTable";
import {
  getDataAsOfDate,
  getEmployeeDirectory,
} from "@/lib/employees/get-employee-directory";
import {
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
  type EmployeeCategoryFilter,
  type EmployeeDirectoryFilters,
  type EmployeeStatusFilter,
} from "@/lib/employees/types";

export const metadata: Metadata = {
  title: "데이터 관리",
};

export const dynamic = "force-dynamic";

function readParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function readCategory(value: string): EmployeeCategoryFilter {
  return (CATEGORY_OPTIONS as readonly string[]).includes(value)
    ? (value as EmployeeCategoryFilter)
    : "전체";
}

function readStatus(value: string): EmployeeStatusFilter {
  return (STATUS_OPTIONS as readonly string[]).includes(value)
    ? (value as EmployeeStatusFilter)
    : "전체";
}

function readPage(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function DataPage({
  searchParams,
}: {
  searchParams: Promise<{
    employeeNo?: string | string[];
    name?: string | string[];
    department?: string | string[];
    category?: string | string[];
    status?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const filters: EmployeeDirectoryFilters = {
    employeeNo: readParam(params.employeeNo),
    name: readParam(params.name),
    department: readParam(params.department),
    category: readCategory(readParam(params.category)),
    status: readStatus(readParam(params.status)),
    page: readPage(readParam(params.page)),
  };

  const [asOfDate, directory] = await Promise.all([
    getDataAsOfDate(),
    getEmployeeDirectory(filters),
  ]);

  return (
    <DataManagementClient
      asOfDate={asOfDate}
      totalCount={directory.ok ? directory.data.totalCount : null}
    >
      <section className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-navy-900">교직원 명부</h2>
          <p className="mt-1 text-xs text-muted">
            한 화면 20명씩 조회합니다. Excel 업로드는 미리보기만 하며 원장에
            바로 반영하지 않습니다.
          </p>
        </div>

        <EmployeeSearchForm filters={filters} />

        {directory.ok ? (
          directory.data.rows.length > 0 ? (
            <>
              <EmployeeRosterTable rows={directory.data.rows} />
              <EmployeePagination
                filters={filters}
                totalCount={directory.data.totalCount}
              />
            </>
          ) : (
            <>
              <EmployeeRosterEmpty />
              <EmployeePagination
                filters={filters}
                totalCount={directory.data.totalCount}
              />
            </>
          )
        ) : (
          <p className="px-5 py-10 text-center text-sm text-slate-600">
            교직원 데이터를 불러오기 위한 권한 설정이 필요합니다.
          </p>
        )}
      </section>
    </DataManagementClient>
  );
}
