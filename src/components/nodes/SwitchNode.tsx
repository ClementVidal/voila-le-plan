import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { GraphNode } from "../../types";

export type SwitchNodeData = {
  graphNode: GraphNode; // kind === "switch"
  activeBranch: string;
  onToggle: (switchId: string, branch: string) => void;
};

function SwitchNodeImpl({ data }: { data: SwitchNodeData }) {
  const { graphNode, activeBranch, onToggle } = data;
  const branches = graphNode.branches ?? [];
  return (
    <div className="node node--switch">
      <Handle type="target" position={Position.Left} />
      <div className="node__kind">Aiguillage</div>
      <div className="node__title node__title--small">{graphNode.title}</div>
      <div className="switch__branches">
        {branches.map((branch) => (
          <button
            key={branch.key}
            type="button"
            className={`switch__branch switch__branch--${branch.key}${
              branch.key === activeBranch ? " switch__branch--active" : ""
            }`}
            onClick={() => onToggle(graphNode.id, branch.key)}
          >
            {branch.label}
          </button>
        ))}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export const SwitchNode = memo(SwitchNodeImpl);
