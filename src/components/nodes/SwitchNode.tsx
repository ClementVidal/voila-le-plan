import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { Switch } from "../../types";

export type SwitchNodeData = {
  switchData: Switch;
  activeBranch: string;
  onToggle: (switchId: string, branch: string) => void;
};

function SwitchNodeImpl({ data }: { data: SwitchNodeData }) {
  const { switchData, activeBranch, onToggle } = data;
  return (
    <div className="node node--switch">
      <Handle type="target" position={Position.Left} />
      <div className="node__kind">Aiguillage</div>
      <div className="node__title node__title--small">{switchData.label}</div>
      <div className="switch__branches">
        {switchData.branches.map((branch) => (
          <button
            key={branch.key}
            type="button"
            className={`switch__branch switch__branch--${branch.key}${
              branch.key === activeBranch ? " switch__branch--active" : ""
            }`}
            onClick={() => onToggle(switchData.id, branch.key)}
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
