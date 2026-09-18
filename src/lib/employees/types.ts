export const EMPLOYEE_PAGE_SIZE = 20;

export const CATEGORY_OPTIONS = ["전체", "교원", "직원"] as const;
export const STATUS_OPTIONS = ["전체", "재직", "휴직", "퇴직"] as const;

export type EmployeeCategoryFilter = (typeof CATEGORY_OPTIONS)[number];
export type EmployeeStatusFilter = (typeof STATUS_OPTIONS)[number];

export type EmployeeDirectoryFilters = {
  employeeNo: string;
  name: string;
  department: string;
  category: EmployeeCategoryFilter;
  status: EmployeeStatusFilter;
  page: number;
};

export type EmployeeDirectoryRow = {
  employeeNo: string;
  name: string;
  employeeCategory: string;
  parentOrg: string;
  department: string;
  jobGroup: string;
  jobGrade: string;
  employmentType: string;
  employmentStatus: string;
};

export type EmployeeDirectoryData = {
  rows: EmployeeDirectoryRow[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type EmployeeDirectoryResult =
  | { ok: true; data: EmployeeDirectoryData }
  | { ok: false };
