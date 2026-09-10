import type { ValidationStatus } from "../types";

const LABELS: Record<ValidationStatus, string> = {
  brouillon: "Brouillon",
  interpretation: "Interprétation",
  valide_lfi: "Validé LFI",
};

export function StatusBadge({ status }: { status: ValidationStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{LABELS[status]}</span>;
}
