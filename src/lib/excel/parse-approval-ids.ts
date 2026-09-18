function parseIdList(raw: FormDataEntryValue | null, label: string) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { ok: true as const, ids: [] as string[] };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((id) => typeof id !== "string")) {
      return {
        ok: false as const,
        message: `${label} 형식이 올바르지 않습니다. 원장 데이터는 변경되지 않았습니다.`,
      };
    }

    const ids = parsed.map((id) => id.trim()).filter(Boolean);
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      return {
        ok: false as const,
        message: `${label}에 중복된 교직원번호가 있습니다. 원장 데이터는 변경되지 않았습니다.`,
      };
    }

    return { ok: true as const, ids };
  } catch {
    return {
      ok: false as const,
      message: `${label} 형식이 올바르지 않습니다. 원장 데이터는 변경되지 않았습니다.`,
    };
  }
}

export function parseApprovalIds(formData: FormData) {
  const created = parseIdList(formData.get("createdIds"), "신규 승인 목록");
  if (!created.ok) {
    return created;
  }
  const changed = parseIdList(formData.get("changedIds"), "변경 승인 목록");
  if (!changed.ok) {
    return changed;
  }
  const retired = parseIdList(formData.get("retiredIds"), "퇴직 후보 승인 목록");
  if (!retired.ok) {
    return retired;
  }

  return {
    ok: true as const,
    createdIds: created.ids,
    changedIds: changed.ids,
    retiredIds: retired.ids,
  };
}
