import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { HeaderAuthStatus } from "@/components/layout/HeaderAuthStatus";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UniHR Insight",
    template: "%s | UniHR Insight",
  },
  description:
    "생성형 AI 기반 대학 인사 데이터 분석·업무지원 시스템. 대학 인사·법인행정 직무 포트폴리오 데모.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AppShell authSlot={<HeaderAuthStatus />}>{children}</AppShell>
      </body>
    </html>
  );
}
