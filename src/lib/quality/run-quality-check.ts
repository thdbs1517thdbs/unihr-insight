import { QUALITY_ISSUE_TYPES, type QualityIssue, type QualitySummary } from "./types";
import { inspectEmployee, type QualityEmployee } from "./rules";

export function runQualityCheck(employees: QualityEmployee[]): {
  summary: QualitySummary;
  issues: QualityIssue[];
} {
  const idCounts = new Map<string, number>();
  for (const employee of employees) {
    if (!employee.employeeId) {
      continue;
    }
    idCounts.set(employee.employeeId, (idCounts.get(employee.employeeId) ?? 0) + 1);
  }

  const issues: QualityIssue[] = [];
  const employeesWithIssues = new Set<string>();

  for (const employee of employees) {
    const found = inspectEmployee(employee, idCounts);
    if (found.length === 0) {
      continue;
    }
    issues.push(...found);
    employeesWithIssues.add(`${employee.rowNumber}:${employee.employeeId}`);
  }

  const typeCounts = Object.fromEntries(
    QUALITY_ISSUE_TYPES.map((type) => [type, 0]),
  ) as QualitySummary["typeCounts"];

  for (const issue of issues) {
    typeCounts[issue.issueType] += 1;
  }

  const typeCount = QUALITY_ISSUE_TYPES.filter(
    (type) => typeCounts[type] > 0,
  ).length;

  return {
    summary: {
      checkedCount: employees.length,
      normalCount: employees.length - employeesWithIssues.size,
      issueEmployeeCount: employeesWithIssues.size,
      issueCount: issues.length,
      typeCount,
      typeCounts,
    },
    issues,
  };
}
