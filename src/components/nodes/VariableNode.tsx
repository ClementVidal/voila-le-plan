import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { GraphNode } from "../../types";

export type VariableNodeData = { graphNode: GraphNode; dimmed: boolean };

function VariableNodeImpl({ data }: { data: VariableNodeData }) {
  const { graphNode, dimmed } = data;
  return (
    <div className={`node node--variable${dimmed ? " node--dimmed" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node__kind">Variable</div>
      <div className="node__title">{graphNode.title}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export const VariableNode = memo(VariableNodeImpl);
