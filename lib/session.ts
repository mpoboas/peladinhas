import type { Session } from "./types";

/** Limite de caracteres para o nome custom da sessão. */
export const SESSION_LABEL_MAX_LENGTH = 80;

export function hasCustomSessionLabel(
  label: string | undefined | null,
): boolean {
  return Boolean(label?.trim());
}

/** Título visível: label custom ou "Peladinha #N". */
export function getSessionDisplayTitle(
  session: Pick<Session, "label">,
  recordNumber: number,
): string {
  if (hasCustomSessionLabel(session.label)) {
    return session.label!.trim();
  }
  return `Peladinha #${recordNumber}`;
}

/** Normaliza label vindo de formulário — trim + limite de caracteres. */
export function normalizeSessionLabel(
  value: FormDataEntryValue | null | undefined,
): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  return trimmed.slice(0, SESSION_LABEL_MAX_LENGTH);
}

export function getCostPerPerson(
  cost: number | undefined | null,
  attendanceCount: number,
): number | null {
  if (cost == null || cost <= 0 || attendanceCount <= 0) return null;
  return Math.round((cost / attendanceCount) * 100) / 100;
}

export function formatCostEUR(value: number): string {
  return value.toLocaleString("pt-PT", {
    style: "currency",
    currency: "EUR",
  });
}

export function isCancelledSession(notes?: string): boolean {
  return Boolean(notes?.trim().toUpperCase().startsWith("[CANCELADO]"));
}
