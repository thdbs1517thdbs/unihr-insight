import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "관리자 로그인",
};

export default async function AdminLoginPage() {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium tracking-wide text-muted">
          UniHR Insight
        </p>
        <h1 className="mt-1 text-xl font-semibold text-navy-900">
          관리자 로그인
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          인사 데이터 적용 등 쓰기 작업은 관리자만 수행할 수 있습니다.
          이 화면에서는 조회·업로드 미리보기 기능은 그대로 사용할 수 있습니다.
        </p>

        {admin.ok ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-md border border-line bg-background px-3 py-2 text-sm text-navy-900">
              이미 관리자로 로그인되어 있습니다.
            </p>
            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-background"
              >
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-6">
            <LoginForm />
          </div>
        )}
      </div>
    </div>
  );
}
