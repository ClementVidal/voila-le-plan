import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { GraphNode } from "../../types";
import { StatusBadge } from "../StatusBadge";

export type GenericNodeData = { graphNode: GraphNode; dimmed: boolean };

const KIND_LABELS: Partial<Record<GraphNode["kind"], string>> = {
  partie: "Partie",
  chapitre: "Chapitre",
  section: "Section",
  acteur: "Acteur",
  principe: "Principe",
};

/** Rendu par défaut pour les kinds sans composant dédié (structure du programme, acteurs, principes). */
function GenericNodeImpl({ data }: { data: GenericNodeData }) {
  const { graphNode, dimmed } = data;
  return (
    <div className={`node node--generic${dimmed ? " node--dimmed" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node__kind">{KIND_LABELS[graphNode.kind] ?? graphNode.kind}</div>
      <div className="node__title">{graphNode.title}</div>
      <StatusBadge status={graphNode.status} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export const GenericNode = memo(GenericNodeImpl);
