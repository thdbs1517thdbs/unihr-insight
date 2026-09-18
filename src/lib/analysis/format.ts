export function formatPercent(part: number, whole: number) {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) {
    return "0.0";
  }
  return ((part / whole) * 100).toFixed(1);
}

export function formatDateLabel(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${year}.${month}.${day}`;
}
