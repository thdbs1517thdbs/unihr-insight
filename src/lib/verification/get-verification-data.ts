import { createSupabaseClient } from "@/lib/supabase/client";
import { buildVerificationData } from "./build-verification";
import { mapDisclosureRow, parseDisclosurePayload } from "./map-rows";
import type { VerificationData } from "./types";

export async function getVerificationData(): Promise<
  { ok: true; data: VerificationData } | { ok: false }
> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.rpc("get_disclosure_statistics");

    if (error) {
      return { ok: false };
    }

    const rows = parseDisclosurePayload(data);
    if (!rows) {
      return { ok: false };
    }

    const mapped = rows.flatMap((row, index) => {
      if (!row || typeof row !== "object") {
        return [];
      }
      return [mapDisclosureRow(row as Record<string, unknown>, index)];
    });

    return { ok: true, data: buildVerificationData(mapped) };
  } catch {
    return { ok: false };
  }
}
