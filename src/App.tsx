import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { smicEdges, smicNodes, smicSwitches } from "./data/smicMecanisme";
import { buildMechanismGraph } from "./mechanism/buildMechanismGraph";
import { layoutMechanism, NODE_HEIGHT, NODE_WIDTH, type PositionedNode } from "./mechanism/layout";
import { MesureNode, type MesureNodeData } from "./components/nodes/MesureNode";
import { VariableNode, type VariableNodeData } from "./components/nodes/VariableNode";
import { CompteNode, type CompteNodeData } from "./components/nodes/CompteNode";
import { SwitchNode, type SwitchNodeData } from "./components/nodes/SwitchNode";
import { MechanismEdge, type MechanismEdgeData } from "./components/edges/MechanismEdge";
import { SidePanel, type Selection } from "./components/SidePanel";
import { Legend } from "./components/Legend";

const nodeTypes: NodeTypes = {
  mesure: MesureNode,
  variable: VariableNode,
  compte_public: CompteNode,
  switch: SwitchNode,
};

const edgeTypes: EdgeTypes = {
  mechanism: MechanismEdge,
};

export default function App() {
  const [switchStates, setSwitchStates] = useState<Record<string, string>>({});
  const [positions, setPositions] = useState<Map<string, PositionedNode>>(new Map());
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  const graph = useMemo(
    () => buildMechanismGraph(smicNodes, smicEdges, smicSwitches, switchStates),
    [switchStates],
  );

  useEffect(() => {
    let cancelled = false;
    layoutMechanism(graph).then((result) => {
      if (!cancelled) setPositions(result);
    });
    return () => {
      cancelled = true;
    };
    // Ne relayoute que si la forme du graphe change (les branches inactives
    // restent visibles, grisées, plutôt que de faire bouger tout le schéma).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph.nodes.length, graph.edges.length]);

  const onToggleSwitch = (switchId: string, branch: string) => {
    setSwitchStates((prev) => ({ ...prev, [switchId]: branch }));
  };

  const flowNodes: Node[] = graph.nodes.map((renderNode) => {
    const position = positions.get(renderNode.id) ?? { x: 0, y: 0, width: NODE_WIDTH, height: NODE_HEIGHT };
    const dimmed = !graph.reachable.has(renderNode.id);

    if (renderNode.renderKind === "switch") {
      const sw = smicSwitches.find((s) => s.id === renderNode.switchData.id)!;
      const data: SwitchNodeData = {
        switchData: sw,
        activeBranch: switchStates[sw.id] ?? sw.defaultBranch,
        onToggle: onToggleSwitch,
      };
      return { id: renderNode.id, type: "switch", position, data, draggable: false };
    }

    const data: MesureNodeData | VariableNodeData | CompteNodeData = {
      graphNode: renderNode.graphNode,
      dimmed,
    };
    return { id: renderNode.id, type: renderNode.renderKind, position, data, draggable: false };
  });

  const nodeTitleLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const node of smicNodes) map.set(node.id, node.title);
    for (const sw of smicSwitches) map.set(`switch::${sw.id}`, sw.label);
    return map;
  }, []);

  const flowEdges: Edge[] = graph.edges.map((edge) => {
    const data: MechanismEdgeData = {
      kind: edge.kind,
      sign: edge.sign,
      nature: edge.nature,
      active: edge.active,
      status: edge.status,
      amountUnchiffered: Boolean(edge.amount?.provisional),
      animate: isAnimating,
    };
    return { id: edge.id, source: edge.source, target: edge.target, type: "mechanism", data };
  });

  const handleNodeClick = (_: unknown, node: Node) => {
    const renderNode = graph.nodes.find((n) => n.id === node.id);
    if (!renderNode || renderNode.renderKind === "switch") return;
    setSelection({ type: "node", node: renderNode.graphNode });
  };

  const handleEdgeClick = (_: unknown, edge: Edge) => {
    const original = smicEdges.find((e) => e.id === edge.id);
    if (!original) return;
    setSelection({
      type: "edge",
      edge: original,
      sourceTitle: nodeTitleLookup.get(original.source) ?? original.source,
      targetTitle: nodeTitleLookup.get(original.target) ?? original.target,
    });
  };

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Voilà le plan — mécanisme SMIC</h1>
          <p className="app__subtitle">
            Boucle salaires → cotisations → Sécurité sociale, avec l'aiguillage « respect / non-respect » de la
            hausse (prototype §11 du document de passation).
          </p>
        </div>
        <button type="button" className="app__animate-toggle" onClick={() => setIsAnimating((v) => !v)}>
          {isAnimating ? "Arrêter la propagation" : "Lancer la propagation"}
        </button>
      </header>
      <div className="app__body">
        <div className="app__canvas">
          {positions.size > 0 ? (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              fitView
              nodesConnectable={false}
              elementsSelectable
              proOptions={{ hideAttribution: true }}
            >
              <Background />
              <Controls showInteractive={false} />
            </ReactFlow>
          ) : (
            <div className="app__loading">Disposition du schéma…</div>
          )}
          <Legend />
        </div>
        <SidePanel selection={selection} onClose={() => setSelection(null)} />
      </div>
    </div>
  );
}
