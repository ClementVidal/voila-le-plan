import type { GraphEdge, GraphNode, Id } from "../types";

/** Arête prête pour le rendu, avec un indicateur d'activité (branche courante des aiguillages). */
export type RenderEdge = GraphEdge & { active: boolean };

export type MechanismGraph = {
  nodes: GraphNode[];
  edges: RenderEdge[];
  reachable: Set<Id>;
};

/**
 * Assemble les nœuds et arêtes bruts en un graphe prêt à être disposé et
 * rendu : chaque arête reçoit un indicateur `active` selon l'état courant
 * des aiguillages (nœuds de kind `switch`), et `reachable` liste les nœuds
 * atteignables depuis les racines en ne suivant que les arêtes actives
 * (§5, motif 2 : « aiguillage conditionnel »).
 */
export function buildMechanismGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  switchStates: Record<Id, string>,
): MechanismGraph {
  const switches = new Map(nodes.filter((n) => n.kind === "switch").map((n) => [n.id, n]));
  const activeBranchOf = (switchId: Id) => switchStates[switchId] ?? switches.get(switchId)?.defaultBranch;

  const edgesWithActivity: RenderEdge[] = edges.map((edge) => ({
    ...edge,
    active: edge.condition ? activeBranchOf(edge.condition.switchId) === edge.condition.branch : true,
  }));

  // Un nœud est atteignable si on peut y arriver depuis les racines en ne
  // suivant que les arêtes actives (branche courante des aiguillages).
  const adjacency = new Map<Id, Id[]>();
  for (const edge of edgesWithActivity) {
    if (!edge.active) continue;
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge.target);
    adjacency.set(edge.source, list);
  }

  const targets = new Set(edges.map((e) => e.target));
  const roots = nodes.filter((n) => !targets.has(n.id)).map((n) => n.id);
  const reachable = new Set<Id>(roots);
  const queue = [...roots];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of adjacency.get(current) ?? []) {
      if (!reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
    }
  }

  const finalEdges = edgesWithActivity.map((edge) => ({
    ...edge,
    active: edge.active && reachable.has(edge.source),
  }));

  return { nodes, edges: finalEdges, reachable };
}
