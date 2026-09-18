import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AdminClientResult =
  | { ok: true; client: SupabaseClient }
  | { ok: false; message: string };

export function createAdminSupabaseClient(): AdminClientResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    return {
      ok: false,
      message:
        "Supabase URL이 없어 원장에 반영할 수 없습니다. 원장 데이터는 변경되지 않았습니다.",
    };
  }

  if (!secretKey) {
    return {
      ok: false,
      message:
        "서버 전용 키가 설정되지 않아 원장에 반영할 수 없습니다. 원장 데이터는 변경되지 않았습니다.",
    };
  }

  return {
    ok: true,
    client: createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
  };
}
