function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatYmd(year: number, month: number, day: number) {
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function normalizeText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value).trim();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return (
      formatYmd(
        value.getFullYear(),
        value.getMonth() + 1,
        value.getDate(),
      ) ?? ""
    );
  }
  return String(value).replace(/\s+/g, " ").trim();
}

export function parseDateValue(value: unknown): { ok: true; value: string } | { ok: false } | { ok: true; value: ""; empty: true } {
  if (value === null || value === undefined) {
    return { ok: true, value: "", empty: true };
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const formatted = formatYmd(
      value.getFullYear(),
      value.getMonth() + 1,
      value.getDate(),
    );
    return formatted ? { ok: true, value: formatted } : { ok: false };
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const parsed = new Date(excelEpoch.getTime() + value * 86400000);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false };
    }
    const formatted = formatYmd(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth() + 1,
      parsed.getUTCDate(),
    );
    return formatted ? { ok: true, value: formatted } : { ok: false };
  }

  const text = normalizeText(value);
  if (!text) {
    return { ok: true, value: "", empty: true };
  }

  const isoPrefix = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoPrefix) {
    const formatted = formatYmd(
      Number(isoPrefix[1]),
      Number(isoPrefix[2]),
      Number(isoPrefix[3]),
    );
    return formatted ? { ok: true, value: formatted } : { ok: false };
  }

  const match = text.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (!match) {
    return { ok: false };
  }

  const formatted = formatYmd(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  );
  return formatted ? { ok: true, value: formatted } : { ok: false };
}
