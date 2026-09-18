import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logout } from "@/app/admin/login/actions";

export async function HeaderAuthStatus() {
  const admin = await requireAdmin();

  if (admin.ok) {
    return (
      <div className="flex items-center gap-3 text-right">
        <div>
          <p className="text-xs text-muted">접속 계정</p>
          <p className="text-sm font-medium text-navy-900">관리자</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-navy-800 hover:bg-background"
          >
            로그아웃
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="text-right">
      <p className="text-xs text-muted">접속 계정</p>
      <Link
        href="/admin/login"
        className="text-sm font-medium text-navy-900 hover:text-accent"
      >
        관리자 로그인
      </Link>
    </div>
  );
}
