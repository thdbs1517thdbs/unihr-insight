"use client";

import { useState, useTransition } from "react";
import { previewQualityIssueStatusChange } from "@/app/quality/actions";
import { QualityStatusBadge } from "@/components/quality/QualityStatusBadge";
import {
  QUALITY_ISSUE_TYPE_LABELS,
  QUALITY_REVIEW_STATUSES,
  type QualityIssue,
  type QualityReviewStatus,
} from "@/lib/quality/types";

const inputClass =
  "h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-navy-900 outline-none focus:border-navy-700";

type QualityIssueDetailModalProps = {
  issue: QualityIssue;
  canManage: boolean;
  onClose: () => void;
};

export function QualityIssueDetailModal({
  issue,
  canManage,
  onClose,
}: QualityIssueDetailModalProps) {
  const [nextStatus, setNextStatus] = useState<QualityReviewStatus>(
    issue.reviewStatus,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handlePreview() {
    startTransition(async () => {
      const result = await previewQualityIssueStatusChange({
        persistKey: issue.persistKey,
        employeeId: issue.employeeId,
        issueType: issue.issueType,
        field: issue.field,
        nextStatus,
      });
      setMessage(result.message);
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-navy-950/40 px-4 py-10">
      <div
        role="dialog"
        aria-labelledby="quality-issue-title"
        className="w-full max-w-xl rounded-lg border border-line bg-white shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h3
              id="quality-issue-title"
              className="text-base font-semibold text-navy-900"
            >
              품질 이슈 상세
            </h3>
            <p className="mt-1 text-xs text-muted">
              처리 상태는 품질 이슈의 검토 상태이며 인사원장 데이터 자체를
              변경하지 않습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-navy-900"
          >
            닫기
          </button>
        </div>

        <dl className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-2">
          <DetailItem label="교직원번호" value={issue.employeeId || "—"} />
          <DetailItem label="성명" value={issue.name || "—"} />
          <DetailItem label="소속부서" value={issue.department || "—"} />
          <DetailItem
            label="문제 유형"
            value={QUALITY_ISSUE_TYPE_LABELS[issue.issueType]}
          />
          <DetailItem label="문제 필드" value={issue.fieldLabel} />
          <DetailItem label="현재 값" value={issue.currentValue} />
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted">문제 내용</dt>
            <dd className="mt-1 text-navy-900">{issue.message}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted">탐지 기준</dt>
            <dd className="mt-1 text-navy-900">{issue.detectionRule}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted">처리상태</dt>
            <dd className="mt-1">
              <QualityStatusBadge status={issue.reviewStatus} />
            </dd>
          </div>
        </dl>

        <div className="border-t border-line px-5 py-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              처리상태 변경
            </span>
            <select
              value={nextStatus}
              disabled={!canManage || pending}
              onChange={(event) =>
                setNextStatus(event.target.value as QualityReviewStatus)
              }
              className={inputClass}
            >
              {QUALITY_REVIEW_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-xs text-muted">
            저장은 아직 DB에 반영되지 않습니다. 관리자 검증 미리보기만
            가능합니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canManage || pending}
              onClick={handlePreview}
              className="h-9 rounded-md border border-line px-4 text-sm font-medium text-navy-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              {pending ? "검증 중..." : "저장 미리보기"}
            </button>
            <button
              type="button"
              disabled
              className="h-9 rounded-md bg-slate-300 px-4 text-sm font-medium text-white"
            >
              처리상태 저장
            </button>
          </div>
          {!canManage ? (
            <p className="mt-2 text-xs text-slate-600">
              처리상태 변경은 관리자만 사용할 수 있습니다.
            </p>
          ) : null}
          {message ? (
            <p className="mt-2 text-xs text-navy-800">{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-navy-900">{value}</dd>
    </div>
  );
}
