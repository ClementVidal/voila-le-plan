import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

import { useMechanismData } from "./data/useMechanismData";
import { buildMechanismGraph } from "./mechanism/buildMechanismGraph";
import { useLayoutedGraph } from "./mechanism/useLayoutedGraph";
import { NODE_HEIGHT, NODE_WIDTH } from "./mechanism/layout";
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

export default function MechanismView() {
  const dataState = useMechanismData();
  const [switchStates, setSwitchStates] = useState<Record<string, string>>({});
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  const data = dataState.status === "ready" ? dataState.data : null;

  const graph = useMemo(
    () => (data ? buildMechanismGraph(data.nodes, data.edges, switchStates) : null),
    [data, switchStates],
  );

  const positions = useLayoutedGraph(graph);

  const onToggleSwitch = (switchId: string, branch: string) => {
    setSwitchStates((prev) => ({ ...prev, [switchId]: branch }));
  };

  const nodeTitleLookup = useMemo(() => {
    const map = new Map<string, string>();
    if (!data) return map;
    for (const node of data.nodes) map.set(node.id, node.title);
    return map;
  }, [data]);

  if (dataState.status === "loading") {
    return <div className="app__loading">Chargement des données…</div>;
  }
  if (dataState.status === "error") {
    return (
      <div className="app__loading app__loading--error">
        Impossible de charger les données : {dataState.message}
      </div>
    );
  }
  if (!graph || !data) return null;
  const layoutReady = positions.size > 0;

  const flowNodes: Node[] = graph.nodes.map((graphNode) => {
    const position = positions.get(graphNode.id) ?? { x: 0, y: 0, width: NODE_WIDTH, height: NODE_HEIGHT };
    const dimmed = !graph.reachable.has(graphNode.id);

    if (graphNode.kind === "switch") {
      const nodeData: SwitchNodeData = {
        graphNode,
        activeBranch: switchStates[graphNode.id] ?? graphNode.defaultBranch ?? "",
        onToggle: onToggleSwitch,
      };
      return { id: graphNode.id, type: "switch", position, data: nodeData, draggable: false };
    }

    const nodeData: MesureNodeData | VariableNodeData | CompteNodeData = { graphNode, dimmed };
    return { id: graphNode.id, type: graphNode.kind, position, data: nodeData, draggable: false };
  });

  const flowEdges: Edge[] = graph.edges.map((edge) => {
    const edgeData: MechanismEdgeData = {
      kind: edge.kind,
      sign: edge.sign,
      nature: edge.nature,
      active: edge.active,
      status: edge.status,
      amountUnchiffered: Boolean(edge.amount?.provisional),
      animate: isAnimating,
    };
    return { id: edge.id, source: edge.source, target: edge.target, type: "mechanism", data: edgeData };
  });

  const handleNodeClick = (_: unknown, node: Node) => {
    const graphNode = graph.nodes.find((n) => n.id === node.id);
    if (!graphNode) return;
    setSelection({ type: "node", node: graphNode });
  };

  const handleEdgeClick = (_: unknown, edge: Edge) => {
    const original = data.edges.find((e) => e.id === edge.id);
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
          {dataState.source === "draft" && (
            <p className="app__draft-banner">
              Aperçu d'un brouillon local non publié — <Link to="/edit">gérer le brouillon</Link>
            </p>
          )}
        </div>
        <div className="app__header-actions">
          <Link to="/edit" className="app__animate-toggle">
            Éditer les données
          </Link>
          <button type="button" className="app__animate-toggle" onClick={() => setIsAnimating((v) => !v)}>
            {isAnimating ? "Arrêter la propagation" : "Lancer la propagation"}
          </button>
        </div>
      </header>
      <div className="app__body">
        <div className="app__canvas">
          {layoutReady ? (
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
