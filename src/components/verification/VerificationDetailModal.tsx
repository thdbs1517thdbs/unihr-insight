"use client";

import { formatNumber } from "@/lib/format";
import type { DisclosureRow, VerificationStatus } from "@/lib/verification/types";

const statusClass: Record<VerificationStatus, string> = {
  일치: "bg-slate-100 text-slate-700",
  불일치: "bg-amber-50 text-amber-800",
  "확인 필요": "bg-blue-50 text-blue-800",
};

type VerificationDetailModalProps = {
  row: DisclosureRow;
  onClose: () => void;
};

function displayCount(value: number | null) {
  return value === null ? "—" : formatNumber(value);
}

function displayDiff(value: number | null) {
  if (value === null) {
    return "—";
  }
  if (value > 0) {
    return `+${formatNumber(value)}`;
  }
  return formatNumber(value);
}

export function VerificationDetailModal({
  row,
  onClose,
}: VerificationDetailModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-navy-950/40 px-4 py-10">
      <div
        role="dialog"
        aria-labelledby="verification-detail-title"
        className="w-full max-w-xl rounded-lg border border-line bg-white shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h3
              id="verification-detail-title"
              className="text-base font-semibold text-navy-900"
            >
              검증 항목 상세
            </h3>
            <p className="mt-1 text-xs text-muted">
              검증 결과는 시스템 집계와 제출자료의 차이를 확인하기 위한 것으로,
              제출자료를 자동 수정하지 않습니다.
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
          <Item label="작성연도" value={row.referenceYear || "—"} />
          <Item label="통계 구분" value={row.reportCategory || "—"} />
          <div className="sm:col-span-2">
            <Item label="세부 항목" value={row.detailCategory || "—"} />
          </div>
          <Item label="시스템 집계" value={displayCount(row.sourceCount)} />
          <Item label="제출자료" value={displayCount(row.reportedCount)} />
          <Item label="차이" value={displayDiff(row.difference)} />
          <div>
            <dt className="text-xs text-muted">검증 결과</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${statusClass[row.status]}`}
              >
                {row.status}
              </span>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <Item
              label="원천 데이터"
              value={row.sourceDataset || "—"}
            />
          </div>
          <div className="sm:col-span-2">
            <Item label="비고" value={row.remarks || "—"} />
          </div>
        </dl>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-navy-900">{value}</dd>
    </div>
  );
}
