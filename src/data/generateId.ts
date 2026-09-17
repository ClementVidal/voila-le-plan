/** Identifiant court, lisible, suffisant pour des données éditées à la main dans l'UI. */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
