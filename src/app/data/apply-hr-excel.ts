"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { analyzeHrExcel, validateExcelFileMeta } from "@/lib/excel/analyze-upload";
import { buildApplyPayload } from "@/lib/excel/build-apply-payload";
import { parseApprovalIds } from "@/lib/excel/parse-approval-ids";
import { uniqueReferenceDate } from "@/lib/excel/reference-date";
import { prepareDataIssuesFromValidation } from "@/lib/data-issues/prepare-from-validation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { PreviewItem } from "@/lib/excel/types";

export type ApplyHrExcelResult =
  | { ok: false; message: string }
  | {
      ok: true;
      createdCount: number;
      changedCount: number;
      retiredCount: number;
    };

function fail(message: string): ApplyHrExcelResult {
  return { ok: false, message };
}

function indexByEmployeeId(items: PreviewItem[]) {
  return new Map(items.map((item) => [item.employeeId, item]));
}

function readCount(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
}

function mapRpcError(message: string, code?: string) {
  const text = message.toLowerCase();
  if (
    code === "PGRST202" ||
    text.includes("could not find the function") ||
    (text.includes("apply_hr_ledger_changes") && text.includes("does not exist"))
  ) {
    return "인사원장 반영 함수가 아직 설치되지 않았습니다. 원장 데이터는 변경되지 않았습니다.";
  }

  return "적용에 실패했습니다. 원장 데이터는 변경되지 않았습니다.";
}

export async function applyHrExcelChanges(
  formData: FormData,
): Promise<ApplyHrExcelResult> {
  try {
    return await runApplyHrExcelChanges(formData);
  } catch {
    return fail("적용에 실패했습니다. 원장 데이터는 변경되지 않았습니다.");
  }
}

async function runApplyHrExcelChanges(
  formData: FormData,
): Promise<ApplyHrExcelResult> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return fail(`${admin.message} 원장 데이터는 변경되지 않았습니다.`);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return fail(
      "원본 Excel 파일이 없어 적용을 중단했습니다. 원장 데이터는 변경되지 않았습니다.",
    );
  }

  const meta = validateExcelFileMeta(file);
  if (!meta.ok) {
    return fail(`${meta.message} 원장 데이터는 변경되지 않았습니다.`);
  }

  const approval = parseApprovalIds(formData);
  if (!approval.ok) {
    return approval;
  }

  const { createdIds, changedIds, retiredIds } = approval;
  const combined = [...createdIds, ...changedIds, ...retiredIds];
  if (combined.length === 0) {
    return fail(
      "승인한 변경사항이 없습니다. 원장 데이터는 변경되지 않았습니다.",
    );
  }
  if (new Set(combined).size !== combined.length) {
    return fail(
      "승인 목록의 교직원번호가 분류 간에 중복됩니다. 원장 데이터는 변경되지 않았습니다.",
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const analyzed = await analyzeHrExcel(buffer, meta.fileName);
  if (!analyzed.ok) {
    return fail(`${analyzed.message} 원장 데이터는 변경되지 않았습니다.`);
  }

  if (analyzed.preview.compareSource !== "ledger") {
    return fail(
      "현재 원장과 다시 비교할 수 없어 적용을 중단했습니다. 원장 데이터는 변경되지 않았습니다.",
    );
  }

  // data_issues INSERT는 후속 단계에서 연결한다.
  void prepareDataIssuesFromValidation(analyzed.errors);

  const createdMap = indexByEmployeeId(analyzed.preview.created);
  const changedMap = indexByEmployeeId(analyzed.preview.changed);
  const retiredMap = indexByEmployeeId(analyzed.preview.retiredCandidates);
  const errorIds = new Set(
    analyzed.errors.map((item) => item.employeeId).filter(Boolean),
  );

  const approvedCreated: PreviewItem[] = [];
  for (const employeeId of createdIds) {
    if (errorIds.has(employeeId)) {
      return fail(
        "오류 행은 적용할 수 없습니다. 원장 데이터는 변경되지 않았습니다.",
      );
    }
    const item = createdMap.get(employeeId);
    if (!item) {
      return fail(
        "승인한 신규 교직원번호가 서버 재검증 결과와 일치하지 않습니다. 원장 데이터는 변경되지 않았습니다.",
      );
    }
    approvedCreated.push(item);
  }

  const approvedChanged: PreviewItem[] = [];
  for (const employeeId of changedIds) {
    if (errorIds.has(employeeId)) {
      return fail(
        "오류 행은 적용할 수 없습니다. 원장 데이터는 변경되지 않았습니다.",
      );
    }
    const item = changedMap.get(employeeId);
    if (!item?.changes?.length) {
      return fail(
        "승인한 변경 교직원번호가 서버 재검증 결과와 일치하지 않습니다. 원장 데이터는 변경되지 않았습니다.",
      );
    }
    approvedChanged.push(item);
  }

  const approvedRetiredIds: string[] = [];
  for (const employeeId of retiredIds) {
    const item = retiredMap.get(employeeId);
    if (!item) {
      return fail(
        "승인한 퇴직 후보 교직원번호가 서버 재검증 결과와 일치하지 않습니다. 원장 데이터는 변경되지 않았습니다.",
      );
    }
    if (item.category !== "retiredCandidate") {
      return fail(
        "퇴직 후보가 아닌 항목은 퇴직 처리할 수 없습니다. 원장 데이터는 변경되지 않았습니다.",
      );
    }
    if (item.employmentStatus === "퇴직") {
      continue;
    }
    approvedRetiredIds.push(employeeId);
  }

  const reference = uniqueReferenceDate(analyzed.validRows);
  if (!reference.ok) {
    return reference;
  }

  if (
    approvedCreated.length === 0 &&
    approvedChanged.length === 0 &&
    approvedRetiredIds.length === 0
  ) {
    return fail(
      "적용할 변경사항이 없습니다. 원장 데이터는 변경되지 않았습니다.",
    );
  }

  let payload;
  try {
    payload = buildApplyPayload({
      fileName: meta.fileName,
      referenceDate: reference.referenceDate,
      totalRows: analyzed.rows.length,
      errorRows: analyzed.errors.length,
      validRows: analyzed.validRows,
      createdItems: approvedCreated,
      changedItems: approvedChanged,
      retiredIds: approvedRetiredIds,
    });
  } catch {
    return fail(
      "반영 데이터를 구성하지 못했습니다. 원장 데이터는 변경되지 않았습니다.",
    );
  }

  const adminClient = createAdminSupabaseClient();
  if (!adminClient.ok) {
    return fail(adminClient.message);
  }

  const { data, error } = await adminClient.client.rpc("apply_hr_ledger_changes", {
    p_file_name: payload.p_file_name,
    p_reference_date: payload.p_reference_date,
    p_total_rows: payload.p_total_rows,
    p_error_rows: payload.p_error_rows,
    p_created: payload.p_created,
    p_changed: payload.p_changed,
    p_retired_ids: payload.p_retired_ids,
  });

  if (error) {
    return fail(mapRpcError(error.message, error.code));
  }

  const record =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};

  const createdCount =
    readCount(record, ["created_rows", "new_rows", "created"]) ??
    payload.p_created.length;
  const changedCount =
    readCount(record, ["changed_rows", "changed"]) ?? payload.p_changed.length;
  const retiredCount =
    readCount(record, ["retired_processed", "retired_rows", "retired"]) ??
    payload.p_retired_ids.length;

  revalidatePath("/");
  revalidatePath("/data");

  return {
    ok: true,
    createdCount,
    changedCount,
    retiredCount,
  };
}
