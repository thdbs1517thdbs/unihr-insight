"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, WORKFLOW_STEPS } from "@/lib/navigation";
import { CloseIcon } from "./Icons";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-navy-950/40 lg:hidden"
          aria-label="메뉴 닫기"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-950 text-slate-100 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/" className="min-w-0" onClick={onClose}>
            <p className="text-[11px] font-medium tracking-wide text-slate-400">
              대학 인사 업무지원
            </p>
            <p className="truncate text-base font-semibold tracking-tight text-white">
              UniHR Insight
            </p>
          </Link>
          <button
            type="button"
            className="rounded p-1 text-slate-300 hover:bg-white/10 lg:hidden"
            onClick={onClose}
            aria-label="사이드바 닫기"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-sm font-medium text-white">대학본부 인사팀</p>
          <p className="mt-1 text-xs text-slate-400">포트폴리오 데모 시스템</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="주 메뉴">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-start gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-white/12 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span
                      className={`mt-0.5 h-5 w-1 shrink-0 rounded-full ${
                        active ? "bg-blue-400" : "bg-transparent"
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {"step" in item && item.step ? (
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] tracking-wide text-slate-300">
                            {item.step}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <p className="mb-2 text-[11px] font-medium tracking-wide text-slate-400">
            업무 흐름
          </p>
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[10px] tracking-wide text-slate-400">
            {WORKFLOW_STEPS.map((step, index) => (
              <li key={step.key} className="flex items-center gap-1">
                <Link
                  href={step.href}
                  onClick={onClose}
                  className="rounded px-1 py-0.5 hover:bg-white/10 hover:text-white"
                >
                  {step.key}
                </Link>
                {index < WORKFLOW_STEPS.length - 1 ? (
                  <span aria-hidden className="text-slate-600">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </>
  );
}
