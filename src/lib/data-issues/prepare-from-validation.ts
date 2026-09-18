import type { PreviewItem } from "@/lib/excel/types";

export type PreparedDataIssue = {
  employeeId: string;
  rowNumber?: number;
  messages: string[];
};

export function prepareDataIssuesFromValidation(errors: PreviewItem[]) {
  return errors.map((item) => ({
    employeeId: item.employeeId,
    rowNumber: item.rowNumber,
    messages: item.messages ?? [],
  })) satisfies PreparedDataIssue[];
}
