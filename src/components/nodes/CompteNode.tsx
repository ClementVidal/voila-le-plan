import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { GraphNode } from "../../types";

export type CompteNodeData = { graphNode: GraphNode; dimmed: boolean };

function CompteNodeImpl({ data }: { data: CompteNodeData }) {
  const { graphNode, dimmed } = data;
  return (
    <div className={`node node--compte${dimmed ? " node--dimmed" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node__kind">Compte public</div>
      <div className="node__title">{graphNode.title}</div>
      <div className="node__provisional">Solde à chiffrer</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export const CompteNode = memo(CompteNodeImpl);
