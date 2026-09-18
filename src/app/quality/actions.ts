"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getQualityReport } from "@/lib/quality/get-quality-report";
import {
  isQualityIssueTypeValue,
  isQualityReviewStatus,
  resolvedAtForStatus,
  toDataIssueInsertRow,
} from "@/lib/quality/data-issues";
import { qualityPersistKey } from "@/lib/quality/rules";

export type QualityStatusPreviewResult =
  | {
      ok: false;
      message: string;
    }
  | {
      ok: true;
      persisted: false;
      message: string;
      nextStatus: string;
      resolvedAt: "now" | null;
    };

function fail(message: string): QualityStatusPreviewResult {
  return { ok: false, message };
}

export async function previewQualityIssueStatusChange(input: {
  persistKey: string;
  employeeId: string;
  issueType: string;
  field: string;
  nextStatus: string;
}): Promise<QualityStatusPreviewResult> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return fail(admin.message);
  }

  if (!isQualityReviewStatus(input.nextStatus)) {
    return fail("허용되지 않은 처리상태입니다.");
  }

  if (!isQualityIssueTypeValue(input.issueType)) {
    return fail("허용되지 않은 문제 유형입니다.");
  }

  const expectedKey = qualityPersistKey(
    input.employeeId,
    input.issueType,
    input.field,
  );
  if (!input.persistKey || input.persistKey !== expectedKey) {
    return fail("이슈 식별 값이 올바르지 않습니다.");
  }

  const report = await getQualityReport();
  if (!report.ok) {
    return fail("현재 점검 결과를 확인할 수 없습니다.");
  }

  const found = report.issues.find(
    (issue) =>
      issue.persistKey === expectedKey &&
      issue.employeeId === input.employeeId &&
      issue.issueType === input.issueType &&
      issue.field === input.field,
  );

  if (!found) {
    return fail("현재 자동 점검에서 해당 문제를 찾을 수 없습니다.");
  }

  void toDataIssueInsertRow(found);

  return {
    ok: true,
    persisted: false,
    nextStatus: input.nextStatus,
    resolvedAt: resolvedAtForStatus(input.nextStatus),
    message:
      "처리상태 저장은 아직 준비되지 않았습니다. 인사원장 데이터와 data_issues는 변경되지 않았습니다.",
  };
}
