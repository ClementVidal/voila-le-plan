import { useEffect, useState } from "react";
import type { MechanismGraph } from "./buildMechanismGraph";
import { layoutMechanism, type PositionedNode } from "./layout";

/**
 * Calcule la disposition ELK d'un graphe mécanisme. Ne relayoute que si la
 * forme du graphe change (nombre de nœuds/arêtes) : les branches inactives
 * d'un aiguillage restent visibles, grisées, plutôt que de faire bouger tout
 * le schéma à chaque bascule (§9).
 */
export function useLayoutedGraph(graph: MechanismGraph | null): Map<string, PositionedNode> {
  const [positions, setPositions] = useState<Map<string, PositionedNode>>(new Map());
  const nodeCount = graph?.nodes.length ?? 0;
  const edgeCount = graph?.edges.length ?? 0;

  useEffect(() => {
    if (!graph) {
      setPositions(new Map());
      return;
    }
    let cancelled = false;
    layoutMechanism(graph).then((result) => {
      if (!cancelled) setPositions(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeCount, edgeCount]);

  return positions;
}
