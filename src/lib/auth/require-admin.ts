import { createServerSupabaseClient } from "@/lib/supabase/server";

export type RequireAdminResult =
  | { ok: true; email: string; userId: string }
  | { ok: false; message: string };

function matchesAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return false;
  }

  return email.toLowerCase() === adminEmail.toLowerCase();
}

export async function requireAdmin(): Promise<RequireAdminResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email) {
    return { ok: false, message: "관리자 로그인이 필요합니다." };
  }

  if (!process.env.ADMIN_EMAIL) {
    return { ok: false, message: "관리자 설정이 없습니다." };
  }

  if (!matchesAdminEmail(data.user.email)) {
    return { ok: false, message: "관리자 권한이 없습니다." };
  }

  return {
    ok: true,
    email: data.user.email,
    userId: data.user.id,
  };
}
