import ELK from "elkjs/lib/elk.bundled.js";
import type { MechanismGraph } from "./buildMechanismGraph";

const elk = new ELK();

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 88;

export type PositionedNode = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Dispose la vue mécanisme avec ELK (algorithme hiérarchique `layered`,
 * direction gauche → droite), comme demandé au §9 : aucune position n'est
 * stockée pour cette vue, tout est recalculé au rendu.
 */
export async function layoutMechanism(graph: MechanismGraph): Promise<Map<string, PositionedNode>> {
  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.spacing.nodeNode": "48",
      "elk.edgeRouting": "ORTHOGONAL",
    },
    children: graph.nodes.map((node) => ({
      id: node.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const result = await elk.layout(elkGraph);
  const positions = new Map<string, PositionedNode>();
  for (const child of result.children ?? []) {
    positions.set(child.id!, {
      id: child.id!,
      x: child.x ?? 0,
      y: child.y ?? 0,
      width: child.width ?? NODE_WIDTH,
      height: child.height ?? NODE_HEIGHT,
    });
  }
  return positions;
}
