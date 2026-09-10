import type { GraphEdge, GraphNode, Id, Switch } from "../types";

export type RenderNodeKind = GraphNode["kind"] | "switch";

/** Nœud prêt pour le rendu : soit une donnée du graphe, soit un aiguillage. */
export type RenderNode =
  | { id: Id; renderKind: GraphNode["kind"]; graphNode: GraphNode }
  | { id: Id; renderKind: "switch"; switchData: Switch };

/** Arête prête pour le rendu, réécrite pour partir du nœud-aiguillage visuel. */
export type RenderEdge = GraphEdge & { active: boolean };

export type MechanismGraph = {
  nodes: RenderNode[];
  edges: RenderEdge[];
  reachable: Set<Id>;
};

const switchRenderId = (switchId: Id) => `switch::${switchId}`;

/**
 * Assemble les données brutes (nœuds, arêtes, aiguillages) en un graphe prêt
 * à être disposé et rendu : chaque `Switch` référencé par des arêtes
 * `condition.switchId` devient un nœud visuel inséré entre sa source commune
 * et ses branches, et chaque arête reçoit un indicateur `active` selon l'état
 * courant des aiguillages (§5, motif 2 : « aiguillage conditionnel »).
 */
export function buildMechanismGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  switches: Switch[],
  switchStates: Record<Id, string>,
): MechanismGraph {
  const edgesBySwitch = new Map<Id, GraphEdge[]>();
  for (const edge of edges) {
    if (!edge.condition) continue;
    const list = edgesBySwitch.get(edge.condition.switchId) ?? [];
    list.push(edge);
    edgesBySwitch.set(edge.condition.switchId, list);
  }

  const renderNodes: RenderNode[] = nodes.map((graphNode) => ({
    id: graphNode.id,
    renderKind: graphNode.kind,
    graphNode,
  }));

  const renderEdges: RenderEdge[] = [];
  const rewrittenSources = new Map<Id, Id>(); // edge.id -> nouveau source (nœud aiguillage)

  for (const sw of switches) {
    const related = edgesBySwitch.get(sw.id) ?? [];
    if (related.length === 0) continue;

    const switchNodeId = switchRenderId(sw.id);
    renderNodes.push({ id: switchNodeId, renderKind: "switch", switchData: sw });

    // Toutes les arêtes conditionnées par un même aiguillage partagent leur
    // nœud d'origine : on y raccorde l'aiguillage par une arête neutre.
    const originId = related[0].source;
    renderEdges.push({
      id: `${switchNodeId}::entree`,
      kind: "dependance",
      source: originId,
      target: switchNodeId,
      nature: "comptable",
      sources: [],
      status: "brouillon",
      active: true,
    });

    for (const edge of related) {
      rewrittenSources.set(edge.id, switchNodeId);
    }
  }

  const activeBranchOf = (switchId: Id) => switchStates[switchId] ?? switches.find((s) => s.id === switchId)?.defaultBranch;

  // Un nœud est atteignable si on peut y arriver depuis les racines en ne
  // suivant que les arêtes actives (branche courante des aiguillages).
  const adjacency = new Map<Id, Id[]>();
  const rawEdgesForActivity = edges.map((edge) => ({
    ...edge,
    source: rewrittenSources.get(edge.id) ?? edge.source,
    active: edge.condition ? activeBranchOf(edge.condition.switchId) === edge.condition.branch : true,
  }));

  for (const edge of [...renderEdges, ...rawEdgesForActivity]) {
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

  const finalEdges: RenderEdge[] = renderEdges.map((edge) => ({
    ...edge,
    active: edge.active && reachable.has(edge.source),
  }));
  for (const edge of rawEdgesForActivity) {
    finalEdges.push({ ...edge, active: edge.active && reachable.has(edge.source) });
  }

  return { nodes: renderNodes, edges: finalEdges, reachable };
}

export { switchRenderId };
