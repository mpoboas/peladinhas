import { format, isValid, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

/** PocketBase returns dates as `YYYY-MM-DD` or `YYYY-MM-DD HH:mm:ss.sssZ`. */
export function parseSessionDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr?.trim()) return null;

  const trimmed = dateStr.trim();
  const normalized = trimmed.includes("T")
    ? trimmed
    : trimmed.replace(/^(\d{4}-\d{2}-\d{2})\s+/, "$1T");

  let d = parseISO(normalized);
  if (isValid(d)) return d;

  const dateOnly = trimmed.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (dateOnly) {
    d = parseISO(`${dateOnly}T12:00:00`);
    if (isValid(d)) return d;
  }

  return null;
}

export function formatSessionDate(dateStr: string): {
  day: string;
  month: string;
  full: string;
} {
  const d = parseSessionDate(dateStr);
  if (!d) {
    return { day: "—", month: "—", full: "—" };
  }
  return {
    day: format(d, "d"),
    month: format(d, "MMM ''yy", { locale: pt }).toLowerCase(),
    full: format(d, "d MMM yyyy", { locale: pt }),
  };
}
