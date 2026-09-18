import { verifyStatus } from "@/lib/mock-data";

const statusClass = {
  일치: "bg-emerald-50 text-emerald-800",
  차이: "bg-amber-50 text-amber-800",
  검토중: "bg-slate-100 text-slate-700",
};

export function VerifyStatusPanel() {
  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-navy-900">통계자료 검증 현황</h2>
      <p className="mt-1 text-xs text-muted">{verifyStatus.target} (임시 데이터)</p>

      <ul className="mt-4 divide-y divide-line border-t border-line">
        {verifyStatus.items.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm text-navy-900">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted">{item.note}</p>
            </div>
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${statusClass[item.status]}`}
            >
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
