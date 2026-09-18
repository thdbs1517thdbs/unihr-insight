export const EXCEL_COLUMNS = [
  "교직원번호",
  "성명",
  "생년월일",
  "성별",
  "교직원구분",
  "조직구분",
  "상위조직",
  "소속부서",
  "직군",
  "직급",
  "교원유형",
  "비전임유형",
  "고용형태",
  "최초임용일",
  "현직급임용일",
  "계약시작일",
  "계약종료일",
  "재직상태",
  "휴직시작일",
  "휴직종료예정일",
  "퇴직일",
  "기준일",
] as const;

export type ExcelColumn = (typeof EXCEL_COLUMNS)[number];

export const REQUIRED_COLUMNS: ExcelColumn[] = [
  "교직원번호",
  "성명",
  "교직원구분",
  "재직상태",
];

export const DATE_COLUMNS: ExcelColumn[] = [
  "생년월일",
  "최초임용일",
  "현직급임용일",
  "계약시작일",
  "계약종료일",
  "휴직시작일",
  "휴직종료예정일",
  "퇴직일",
  "기준일",
];

export type LedgerField =
  | "name"
  | "birthDate"
  | "gender"
  | "employeeCategory"
  | "orgType"
  | "parentOrg"
  | "department"
  | "jobGroup"
  | "jobGrade"
  | "facultyType"
  | "nonFulltimeType"
  | "employmentType"
  | "firstAppointDate"
  | "currentGradeDate"
  | "contractStart"
  | "contractEnd"
  | "employmentStatus"
  | "leaveStart"
  | "leaveEnd"
  | "retireDate"
  | "asOfDate";

export const COLUMN_TO_FIELD: Record<ExcelColumn, "employeeId" | LedgerField> = {
  교직원번호: "employeeId",
  성명: "name",
  생년월일: "birthDate",
  성별: "gender",
  교직원구분: "employeeCategory",
  조직구분: "orgType",
  상위조직: "parentOrg",
  소속부서: "department",
  직군: "jobGroup",
  직급: "jobGrade",
  교원유형: "facultyType",
  비전임유형: "nonFulltimeType",
  고용형태: "employmentType",
  최초임용일: "firstAppointDate",
  현직급임용일: "currentGradeDate",
  계약시작일: "contractStart",
  계약종료일: "contractEnd",
  재직상태: "employmentStatus",
  휴직시작일: "leaveStart",
  휴직종료예정일: "leaveEnd",
  퇴직일: "retireDate",
  기준일: "asOfDate",
};

export const FIELD_LABELS: Record<LedgerField, string> = {
  name: "성명",
  birthDate: "생년월일",
  gender: "성별",
  employeeCategory: "교직원구분",
  orgType: "조직구분",
  parentOrg: "상위조직",
  department: "소속부서",
  jobGroup: "직군",
  jobGrade: "직급",
  facultyType: "교원유형",
  nonFulltimeType: "비전임유형",
  employmentType: "고용형태",
  firstAppointDate: "최초임용일",
  currentGradeDate: "현직급임용일",
  contractStart: "계약시작일",
  contractEnd: "계약종료일",
  employmentStatus: "재직상태",
  leaveStart: "휴직시작일",
  leaveEnd: "휴직종료예정일",
  retireDate: "퇴직일",
  asOfDate: "기준일",
};

export const DIRECTORY_COMPARE_FIELDS: LedgerField[] = [
  "name",
  "employeeCategory",
  "parentOrg",
  "department",
  "jobGroup",
  "jobGrade",
  "employmentType",
  "employmentStatus",
];

export const FULL_COMPARE_FIELDS: LedgerField[] = Object.keys(
  FIELD_LABELS,
) as LedgerField[];

export type LedgerRecord = {
  employeeId: string;
  name: string;
  birthDate: string;
  gender: string;
  employeeCategory: string;
  orgType: string;
  parentOrg: string;
  department: string;
  jobGroup: string;
  jobGrade: string;
  facultyType: string;
  nonFulltimeType: string;
  employmentType: string;
  firstAppointDate: string;
  currentGradeDate: string;
  contractStart: string;
  contractEnd: string;
  employmentStatus: string;
  leaveStart: string;
  leaveEnd: string;
  retireDate: string;
  asOfDate: string;
};

export type ExcelRow = LedgerRecord & {
  rowNumber: number;
  dateErrors?: string[];
};

export type FieldChange = {
  field: LedgerField;
  label: string;
  before: string;
  after: string;
};

export type PreviewCategory = "created" | "changed" | "retiredCandidate" | "error";

export type PreviewItem = {
  id: string;
  category: PreviewCategory;
  employeeId: string;
  name: string;
  department: string;
  rowNumber?: number;
  messages?: string[];
  changes?: FieldChange[];
  employmentStatus?: string;
};

export type UploadPreviewResult =
  | {
      ok: false;
      message: string;
    }
  | {
      ok: true;
      fileName: string;
      uploadedCount: number;
      compareSource: "ledger" | "directory" | "none";
      created: PreviewItem[];
      changed: PreviewItem[];
      retiredCandidates: PreviewItem[];
      errors: PreviewItem[];
    };
