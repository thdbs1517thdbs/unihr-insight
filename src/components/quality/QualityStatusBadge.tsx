import type { QualityReviewStatus } from "@/lib/quality/types";

const statusClass: Record<QualityReviewStatus, string> = {
  "확인 필요": "bg-amber-50 text-amber-800",
  "확인 중": "bg-blue-50 text-blue-800",
  "처리 완료": "bg-slate-100 text-slate-600",
};

export function QualityStatusBadge({
  status,
}: {
  status: QualityReviewStatus;
}) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${statusClass[status]}`}
    >
      {status}
    </span>
  );
}
