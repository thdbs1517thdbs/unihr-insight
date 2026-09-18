import { formatNumber } from "@/lib/format";
import type { LedgerRecord } from "@/lib/excel/types";
import { formatPercent } from "./format";
import type { AnalysisBreakdown, NamedCount, OrgHeadcount } from "./types";

const FACULTY_TYPE_ORDER = ["전임교원", "비전임교원"];
const FACULTY_GRADE_ORDER = ["교수", "부교수", "조교수"];
const NON_TENURE_ORDER = ["겸임교원", "초빙교원", "강사"];
const EMPLOYMENT_TYPE_ORDER = ["정규직", "무기계약직", "기간제"];
const STAFF_GROUP_ORDER = ["일반행정", "전산", "시설", "사서", "연구·산학"];
const STAFF_GRADE_ORDER = [
  "3급",
  "4급",
  "5급",
  "6급",
  "7급",
  "8급",
  "9급",
  "10급",
  "계약직",
  "무기계약직",
];

function isCurrent(record: LedgerRecord) {
  return record.employmentStatus !== "퇴직";
}

function countInOrder(
  values: string[],
  order: readonly string[],
  leftoverLabel?: string,
) {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) {
      continue;
    }
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const result: NamedCount[] = [];
  const used = new Set<string>();

  for (const label of order) {
    const count = counts.get(label) ?? 0;
    if (count > 0) {
      result.push({ label, count });
    }
    used.add(label);
  }

  if (leftoverLabel) {
    let leftover = 0;
    for (const [label, count] of counts.entries()) {
      if (!used.has(label)) {
        leftover += count;
      }
    }
    if (leftover > 0) {
      result.push({ label: leftoverLabel, count: leftover });
    }
  } else {
    for (const [label, count] of counts.entries()) {
      if (!used.has(label) && count > 0) {
        result.push({ label, count });
      }
    }
  }

  return result;
}

function buildOrganizations(records: LedgerRecord[]): OrgHeadcount[] {
  const map = new Map<string, OrgHeadcount>();

  for (const record of records) {
    const parentOrg = record.parentOrg;
    if (!parentOrg) {
      continue;
    }
    const current = map.get(parentOrg) ?? {
      parentOrg,
      total: 0,
      faculty: 0,
      staff: 0,
    };
    current.total += 1;
    if (record.employeeCategory === "교원") {
      current.faculty += 1;
    }
    if (record.employeeCategory === "직원") {
      current.staff += 1;
    }
    map.set(parentOrg, current);
  }

  return [...map.values()].sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    return a.parentOrg.localeCompare(b.parentOrg, "ko");
  });
}

export function buildAnalysisBreakdown(
  records: LedgerRecord[],
  selectedOrg: string | null,
): AnalysisBreakdown {
  const current = records.filter(isCurrent);
  const scoped = selectedOrg
    ? current.filter((record) => record.parentOrg === selectedOrg)
    : current;

  const faculty = scoped.filter((record) => record.employeeCategory === "교원");
  const staff = scoped.filter((record) => record.employeeCategory === "직원");
  const leave = scoped.filter((record) => record.employmentStatus === "휴직");
  const tenure = faculty.filter((record) => record.facultyType === "전임교원");
  const nonTenure = faculty.filter((record) => record.facultyType === "비전임교원");

  const kpis = {
    total: scoped.length,
    faculty: faculty.length,
    staff: staff.length,
    leave: leave.length,
    facultyShare: Number(formatPercent(faculty.length, scoped.length)),
    staffShare: Number(formatPercent(staff.length, scoped.length)),
    leaveShare: Number(formatPercent(leave.length, scoped.length)),
  };

  const facultyTypes = countInOrder(
    faculty.map((record) => record.facultyType),
    FACULTY_TYPE_ORDER,
  );
  const facultyGrades = countInOrder(
    tenure.map((record) => record.jobGrade),
    FACULTY_GRADE_ORDER,
  );
  const nonTenureTypes = countInOrder(
    nonTenure.map((record) => record.nonFulltimeType),
    NON_TENURE_ORDER,
  );
  const staffEmploymentTypes = countInOrder(
    staff.map((record) => record.employmentType),
    EMPLOYMENT_TYPE_ORDER,
  );
  const staffJobGroups = countInOrder(
    staff.map((record) => record.jobGroup),
    STAFF_GROUP_ORDER,
    "기타",
  );
  const staffGrades = countInOrder(
    staff.map((record) => record.jobGrade),
    STAFF_GRADE_ORDER,
  );

  const organizations = buildOrganizations(current);

  const employmentCounted = staffEmploymentTypes.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const tenureType = facultyTypes.find((item) => item.label === "전임교원");

  return {
    kpis,
    facultyTypes,
    facultyGrades,
    nonTenureTypes,
    staffEmploymentTypes,
    staffJobGroups,
    staffGrades,
    organizations,
    insights: {
      facultyShare: `현재 교원은 전체 현원의 ${formatPercent(faculty.length, scoped.length)}%를 차지합니다.`,
      staffShare: `현재 직원은 전체 현원의 ${formatPercent(staff.length, scoped.length)}%를 차지합니다.`,
      facultyTenure: tenureType
        ? `전임교원은 교원 ${formatNumber(faculty.length)}명 중 ${formatNumber(tenureType.count)}명(${formatPercent(tenureType.count, faculty.length)}%)입니다.`
        : "전임교원 구성 값이 있는 교원만 집계했습니다.",
      staffEmployment:
        employmentCounted === staff.length
          ? `직원 고용형태 합계는 ${formatNumber(employmentCounted)}명입니다.`
          : `고용형태가 있는 직원 ${formatNumber(employmentCounted)}명을 기준으로 구성 비율을 계산했습니다.`,
    },
  };
}
