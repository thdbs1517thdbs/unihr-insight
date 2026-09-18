"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MenuIcon } from "./Icons";

type AppShellProps = {
  children: React.ReactNode;
  authSlot: React.ReactNode;
};

export function AppShell({ children, authSlot }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-full bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-line p-2 text-navy-800 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="메뉴 열기"
            >
              <MenuIcon />
            </button>
            <div>
              <p className="text-sm font-semibold text-navy-900">
                생성형 AI 기반 대학 인사 데이터 분석·업무지원 시스템
              </p>
              <p className="hidden text-xs text-muted sm:block">
                대학 인사·법인행정 직무 포트폴리오 데모
              </p>
            </div>
          </div>
          {authSlot}
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
