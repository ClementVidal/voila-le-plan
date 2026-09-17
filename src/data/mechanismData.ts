import type { GraphEdge, GraphNode, Switch } from "../types";

export type MechanismData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  switches: Switch[];
};

/** Chemin, relatif à la racine du site, du JSON publié qui pilote la vue mécanisme. */
export const MECHANISM_DATA_URL = "/data/smic-mecanisme.json";

/** Clé localStorage du brouillon édité sur `/edit`, prévisualisé sur `/`. */
export const DRAFT_STORAGE_KEY = "voila-le-plan:mechanism-draft";

export async function fetchPublishedMechanismData(): Promise<MechanismData> {
  const response = await fetch(MECHANISM_DATA_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Impossible de charger ${MECHANISM_DATA_URL} (HTTP ${response.status})`);
  }
  return response.json();
}
