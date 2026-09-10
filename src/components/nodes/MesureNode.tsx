import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { GraphNode } from "../../types";
import { StatusBadge } from "../StatusBadge";

export type MesureNodeData = { graphNode: GraphNode; dimmed: boolean };

function MesureNodeImpl({ data }: { data: MesureNodeData }) {
  const { graphNode, dimmed } = data;
  return (
    <div className={`node node--mesure${dimmed ? " node--dimmed" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node__kind">Mesure</div>
      <div className="node__title">{graphNode.title}</div>
      <StatusBadge status={graphNode.status} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export const MesureNode = memo(MesureNodeImpl);
