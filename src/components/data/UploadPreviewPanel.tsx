"use client";

import { useMemo, useState, useTransition } from "react";
import { applyHrExcelChanges } from "@/app/data/apply-hr-excel";
import { formatNumber } from "@/lib/format";
import type { PreviewCategory, PreviewItem, UploadPreviewResult } from "@/lib/excel/types";

type TabId = "all" | PreviewCategory;

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "created", label: "신규" },
  { id: "changed", label: "변경" },
  { id: "retiredCandidate", label: "퇴직 후보" },
  { id: "error", label: "오류" },
];

const categoryLabel: Record<PreviewCategory, string> = {
  created: "신규",
  changed: "변경",
  retiredCandidate: "퇴직 후보",
  error: "오류",
};

const categoryClass: Record<PreviewCategory, string> = {
  created: "bg-blue-50 text-blue-800",
  changed: "bg-amber-50 text-amber-800",
  retiredCandidate: "bg-slate-100 text-slate-700",
  error: "bg-red-50 text-red-700",
};

function isSelectable(item: PreviewItem) {
  return item.category !== "error";
}

type SuccessResult = Extract<UploadPreviewResult, { ok: true }>;

type UploadPreviewPanelProps = {
  result: UploadPreviewResult;
  sourceFile: File | null;
  onClose: () => void;
};

export function UploadPreviewPanel({
  result,
  sourceFile,
  onClose,
}: UploadPreviewPanelProps) {
  if (!result.ok) {
    return (
      <section className="mb-6 rounded-lg border border-red-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-red-700">{result.message}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-navy-900"
          >
            닫기
          </button>
        </div>
      </section>
    );
  }

  return (
    <SuccessPreview
      key={`${result.fileName}-${result.uploadedCount}`}
      result={result}
      sourceFile={sourceFile}
      onClose={onClose}
    />
  );
}

function SuccessPreview({
  result,
  sourceFile,
  onClose,
}: {
  result: SuccessResult;
  sourceFile: File | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabId>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<{
    tone: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const allItems = useMemo(
    () => [
      ...result.created,
      ...result.changed,
      ...result.retiredCandidates,
      ...result.errors,
    ],
    [result],
  );

  const selectableItems = useMemo(
    () => allItems.filter(isSelectable),
    [allItems],
  );

  const itemById = useMemo(
    () => new Map(allItems.map((item) => [item.id, item])),
    [allItems],
  );

  const visible =
    tab === "all" ? allItems : allItems.filter((item) => item.category === tab);
  const visibleSelectable = visible.filter(isSelectable);
  const selectedItems = [...selectedIds]
    .map((id) => itemById.get(id))
    .filter((item): item is PreviewItem => item != null && item.category !== "error");

  const selectedCounts = {
    created: selectedItems.filter((item) => item.category === "created").length,
    changed: selectedItems.filter((item) => item.category === "changed").length,
    retired: selectedItems.filter((item) => item.category === "retiredCandidate")
      .length,
  };

  function toggle(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const item of visibleSelectable) {
        next.add(item.id);
      }
      return next;
    });
  }

  function clearVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const item of visibleSelectable) {
        next.delete(item.id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(selectableItems.map((item) => item.id)));
  }

  function clearAll() {
    setSelectedIds(new Set());
  }

  function submitApply() {
    if (pending) {
      return;
    }

    if (!sourceFile) {
      setConfirmOpen(false);
      setNotice({
        tone: "error",
        message:
          "원본 Excel 파일을 찾을 수 없습니다. 파일을 다시 업로드해 주세요. 원장 데이터는 변경되지 않았습니다.",
      });
      return;
    }

    const formData = new FormData();
    formData.set("file", sourceFile);
    formData.set(
      "createdIds",
      JSON.stringify(
        selectedItems
          .filter((item) => item.category === "created")
          .map((item) => item.employeeId),
      ),
    );
    formData.set(
      "changedIds",
      JSON.stringify(
        selectedItems
          .filter((item) => item.category === "changed")
          .map((item) => item.employeeId),
      ),
    );
    formData.set(
      "retiredIds",
      JSON.stringify(
        selectedItems
          .filter((item) => item.category === "retiredCandidate")
          .map((item) => item.employeeId),
      ),
    );

    startTransition(async () => {
      const result = await applyHrExcelChanges(formData);
      if (result.ok) {
        setConfirmOpen(false);
        setNotice({
          tone: "success",
          message: `반영이 완료되었습니다. 신규 ${formatNumber(result.createdCount)}건, 변경 ${formatNumber(result.changedCount)}건, 퇴직 처리 ${formatNumber(result.retiredCount)}건.`,
        });
        return;
      }
      setConfirmOpen(false);
      setNotice({
        tone: "error",
        message: result.message,
      });
    });
  }

  return (
    <section className="mb-6 rounded-lg border border-line bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-navy-900">
            변경사항 미리보기
          </h2>
          <p className="mt-1 text-xs text-muted">
            {result.fileName} · 담당자가 승인한 항목만 다음 단계에서 반영합니다.
            오류 행은 적용 대상이 아니며, 퇴직 후보는 삭제하지 않습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-line px-3 py-1.5 text-sm text-navy-800 hover:bg-slate-50"
        >
          미리보기 닫기
        </button>
      </div>

      <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="전체 업로드 건수" value={result.uploadedCount} />
        <SummaryCard label="신규" value={result.created.length} />
        <SummaryCard label="변경" value={result.changed.length} />
        <SummaryCard label="퇴직 후보" value={result.retiredCandidates.length} />
        <SummaryCard label="오류" value={result.errors.length} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line px-5 py-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                tab === item.id
                  ? "bg-navy-800 text-white"
                  : "border border-line text-navy-800 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectVisible}
            disabled={visibleSelectable.length === 0}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-navy-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            현재 목록 선택
          </button>
          <button
            type="button"
            onClick={clearVisible}
            disabled={visibleSelectable.length === 0}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-navy-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            현재 목록 해제
          </button>
          <button
            type="button"
            onClick={selectAll}
            disabled={selectableItems.length === 0}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-navy-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            전체 선택
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={selectedIds.size === 0}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-navy-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            전체 해제
          </button>
        </div>
      </div>

      <ul className="divide-y divide-line">
        {visible.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-muted">
            이 분류에 해당하는 항목이 없습니다.
          </li>
        ) : (
          visible.map((item) => (
            <PreviewRow
              key={item.id}
              item={item}
              checked={selectedIds.has(item.id)}
              onToggle={() => toggle(item.id)}
            />
          ))
        )}
      </ul>

      <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          선택 {formatNumber(selectedItems.length)}건
          <span className="ml-2 text-xs text-muted">
            신규 {formatNumber(selectedCounts.created)} · 변경{" "}
            {formatNumber(selectedCounts.changed)} · 퇴직 후보{" "}
            {formatNumber(selectedCounts.retired)}
          </span>
        </p>
        <button
          type="button"
          disabled={selectedItems.length === 0 || pending}
          onClick={() => {
            setNotice(null);
            setConfirmOpen(true);
          }}
          className="rounded-md bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {pending ? "적용 중..." : "선택한 변경사항 적용"}
        </button>
      </div>

      {notice ? (
        <p
          className={`border-t border-line px-5 py-3 text-sm ${
            notice.tone === "error"
              ? "text-red-700"
              : notice.tone === "success"
                ? "text-navy-900"
                : "text-navy-800"
          }`}
        >
          {notice.message}
        </p>
      ) : null}

      {confirmOpen ? (
        <ApplyConfirmModal
          counts={selectedCounts}
          pending={pending}
          onCancel={() => {
            if (!pending) {
              setConfirmOpen(false);
            }
          }}
          onConfirm={submitApply}
        />
      ) : null}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-md border border-line px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 tabular text-xl font-semibold text-navy-900">
        {formatNumber(value)}
      </p>
    </article>
  );
}

function PreviewRow({
  item,
  checked,
  onToggle,
}: {
  item: PreviewItem;
  checked: boolean;
  onToggle: () => void;
}) {
  const selectable = isSelectable(item);

  return (
    <li className="px-5 py-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-navy-800 disabled:cursor-not-allowed"
          checked={selectable ? checked : false}
          disabled={!selectable}
          onChange={onToggle}
          aria-label={`${item.employeeId || "교직원번호 없음"} 반영 대상 선택`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${categoryClass[item.category]}`}
            >
              {categoryLabel[item.category]}
            </span>
            <p className="tabular font-medium text-navy-900">
              {item.employeeId || "교직원번호 없음"}
            </p>
            <p className="text-sm text-slate-600">{item.name}</p>
            {item.department ? (
              <p className="text-xs text-muted">{item.department}</p>
            ) : null}
            {item.rowNumber ? (
              <p className="text-xs text-muted">행 {item.rowNumber}</p>
            ) : null}
            {!selectable ? (
              <p className="text-xs text-red-700">적용 대상 제외</p>
            ) : null}
          </div>

          {item.category === "retiredCandidate" ? (
            <p className="mt-2 text-sm text-slate-600">
              새 파일에 없어 퇴직 후보로만 표시합니다. 승인해도 행을 삭제하지
              않으며, 향후 재직상태 변경으로 처리합니다.
            </p>
          ) : null}

          {item.messages?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
              {item.messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}

          {item.changes?.length ? (
            <ul className="mt-3 space-y-2">
              {item.changes.map((change) => (
                <li
                  key={`${item.employeeId}-${change.field}`}
                  className="rounded-md bg-slate-50 px-3 py-2 text-sm"
                >
                  <p className="font-medium text-navy-900">{change.label}</p>
                  <p className="mt-1 text-slate-600">기존: {change.before}</p>
                  <p className="text-navy-800">변경: {change.after}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function ApplyConfirmModal({
  counts,
  pending,
  onCancel,
  onConfirm,
}: {
  counts: { created: number; changed: number; retired: number };
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 px-4">
      <div
        role="dialog"
        aria-labelledby="apply-confirm-title"
        className="w-full max-w-md rounded-lg border border-line bg-white p-5 shadow-lg"
      >
        <h3
          id="apply-confirm-title"
          className="text-base font-semibold text-navy-900"
        >
          선택한 변경사항을 적용할까요?
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          확인하면 서버가 원본 Excel을 다시 검증한 뒤 승인된 항목만 원장에
          반영합니다. 반영은 한 번에 처리되며, 실패하면 원장은 그대로 유지됩니다.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>신규 {formatNumber(counts.created)}건 · INSERT</li>
          <li>변경 {formatNumber(counts.changed)}건 · 변경된 필드만 UPDATE</li>
          <li>
            퇴직 후보 {formatNumber(counts.retired)}건 · 삭제하지 않고 재직상태를
            퇴직으로 변경
          </li>
          <li>오류 행은 적용 대상에서 제외됩니다.</li>
        </ul>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="rounded-md border border-line px-4 py-2 text-sm text-navy-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            취소
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="rounded-md bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {pending ? "적용 중..." : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
