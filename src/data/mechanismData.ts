import { supabase } from "../supabaseClient";
import type { GraphEdge, GraphNode } from "../types";

/** Un seul objet JSON : les aiguillages sont des GraphNode de kind "switch", pas une liste à part. */
export type MechanismData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

/** Ligne de la table `graphs` (voir supabase/migrations/0001_init.sql) qui pilote la vue mécanisme. */
export const GRAPH_SLUG = "smic-mecanisme";

export async function fetchPublishedMechanismData(): Promise<MechanismData> {
  const { data, error } = await supabase.from("graphs").select("data").eq("slug", GRAPH_SLUG).single();
  if (error) {
    throw new Error(`Impossible de charger le graphe depuis Supabase : ${error.message}`);
  }
  return data.data as MechanismData;
}

/**
 * Écrit le graphe complet. Réservé aux utilisateurs connectés (policy RLS
 * "authenticated users can update graphs") — un appel par un visiteur non
 * connecté échoue avec une erreur RLS, jamais silencieusement.
 */
export async function saveMechanismData(next: MechanismData): Promise<void> {
  const { error } = await supabase.from("graphs").update({ data: next }).eq("slug", GRAPH_SLUG);
  if (error) {
    throw new Error(`Échec de l'enregistrement dans Supabase : ${error.message}`);
  }
}
