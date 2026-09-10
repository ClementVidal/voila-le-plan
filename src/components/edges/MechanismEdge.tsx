import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import type { EdgeKind, ValidationStatus } from "../../types";

export type MechanismEdgeData = {
  kind: EdgeKind;
  sign?: "+" | "-";
  nature: "comptable" | "hypothese";
  active: boolean;
  status: ValidationStatus;
  amountUnchiffered?: boolean;
  animate: boolean;
};

const SIGN_COLOR: Record<"+" | "-", string> = {
  "+": "var(--sign-positive)",
  "-": "var(--sign-negative)",
};

export function MechanismEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const edgeData = data as MechanismEdgeData;
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  const isFlux = edgeData.kind === "flux_financier";
  const isStructural = edgeData.kind === "dependance";
  const color = edgeData.sign ? SIGN_COLOR[edgeData.sign] : "var(--edge-neutral)";
  const strokeWidth = isFlux ? 5 : isStructural ? 1.5 : 2.5;
  const dashed = isStructural || edgeData.nature === "hypothese";

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: color,
          strokeWidth,
          strokeDasharray: dashed ? "6 5" : undefined,
          opacity: edgeData.active ? 1 : 0.2,
        }}
        className={edgeData.active && edgeData.animate ? "edge-animated" : undefined}
      />
      {edgeData.active && (edgeData.sign || edgeData.amountUnchiffered) && (
        <EdgeLabelRenderer>
          <div
            className="edge-label"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              borderColor: color,
              color,
            }}
          >
            {edgeData.sign}
            {edgeData.amountUnchiffered ? " ?" : ""}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
