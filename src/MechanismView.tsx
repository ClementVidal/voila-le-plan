import { useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { GraphEdge, GraphNode, NodeKind } from "./types";
import { useMechanismData } from "./data/useMechanismData";
import { saveMechanismData, type MechanismData } from "./data/mechanismData";
import { validateMechanismData } from "./data/validateMechanismData";
import { generateId } from "./data/generateId";
import { useAuth } from "./auth/useAuth";
import { buildMechanismGraph } from "./mechanism/buildMechanismGraph";
import { useLayoutedGraph } from "./mechanism/useLayoutedGraph";
import { layoutMechanism, NODE_HEIGHT, NODE_WIDTH } from "./mechanism/layout";
import { MesureNode, type MesureNodeData } from "./components/nodes/MesureNode";
import { VariableNode, type VariableNodeData } from "./components/nodes/VariableNode";
import { CompteNode, type CompteNodeData } from "./components/nodes/CompteNode";
import { SwitchNode, type SwitchNodeData } from "./components/nodes/SwitchNode";
import { GenericNode, type GenericNodeData } from "./components/nodes/GenericNode";
import { MechanismEdge, type MechanismEdgeData } from "./components/edges/MechanismEdge";
import { SidePanel, type Selection } from "./components/SidePanel";
import { Legend } from "./components/Legend";
import { EditToolbar } from "./edit/EditToolbar";
import { NodeInspector } from "./edit/NodeInspector";
import { EdgeInspector } from "./edit/EdgeInspector";
import { ValidationReport } from "./edit/ValidationReport";

const nodeTypes: NodeTypes = {
  mesure: MesureNode,
  variable: VariableNode,
  compte_public: CompteNode,
  switch: SwitchNode,
  partie: GenericNode,
  chapitre: GenericNode,
  section: GenericNode,
  acteur: GenericNode,
  principe: GenericNode,
};

const edgeTypes: EdgeTypes = {
  mechanism: MechanismEdge,
};

type EditSelection = { type: "node" | "edge"; id: string } | null;

const clone = (data: MechanismData): MechanismData => JSON.parse(JSON.stringify(data));

/** Recalcule un layout ELK si les positions n'ont jamais été posées (tout à zéro) — première entrée en édition. */
async function seedPositionsIfNeeded(data: MechanismData): Promise<MechanismData> {
  const allZero = data.nodes.every((n) => n.position.x === 0 && n.position.y === 0);
  if (!allZero) return data;
  const graph = buildMechanismGraph(data.nodes, data.edges, {});
  const positions = await layoutMechanism(graph);
  return {
    ...data,
    nodes: data.nodes.map((n) => ({ ...n, position: { x: positions.get(n.id)?.x ?? 0, y: positions.get(n.id)?.y ?? 0 } })),
  };
}

export default function MechanismView() {
  const dataState = useMechanismData();
  const auth = useAuth();
  const [data, setData] = useState<MechanismData | null>(null);
  const [switchStates, setSwitchStates] = useState<Record<string, string>>({});
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<MechanismData | null>(null);
  const [dirty, setDirty] = useState(false);
  const [editSelection, setEditSelection] = useState<EditSelection>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (dataState.status === "ready") {
      setData(dataState.data);
    }
  }, [dataState]);

  const activeData = isEditing ? editableData : data;

  const graph = useMemo(
    () => (activeData ? buildMechanismGraph(activeData.nodes, activeData.edges, switchStates) : null),
    [activeData, switchStates],
  );

  const layoutPositions = useLayoutedGraph(isEditing ? null : graph);
  const positions = isEditing
    ? new Map((editableData?.nodes ?? []).map((n) => [n.id, { ...n.position, width: NODE_WIDTH, height: NODE_HEIGHT }]))
    : layoutPositions;

  const validation = useMemo(() => (editableData ? validateMechanismData(editableData) : null), [editableData]);

  const nodeTitleLookup = useMemo(() => {
    const map = new Map<string, string>();
    if (!activeData) return map;
    for (const node of activeData.nodes) map.set(node.id, node.title);
    return map;
  }, [activeData]);

  // Si le nœud/l'arête sélectionné(e) a été supprimé(e), on ferme l'inspecteur.
  useEffect(() => {
    if (!editSelection || !editableData) return;
    const stillExists =
      editSelection.type === "node"
        ? editableData.nodes.some((n) => n.id === editSelection.id)
        : editableData.edges.some((e) => e.id === editSelection.id);
    if (!stillExists) setEditSelection(null);
  }, [editableData, editSelection]);

  const onToggleSwitch = (switchId: string, branch: string) => {
    setSwitchStates((prev) => ({ ...prev, [switchId]: branch }));
  };

  const startEditing = async () => {
    if (!data || !auth.isAuthenticated) return;
    const seeded = await seedPositionsIfNeeded(clone(data));
    setEditableData(seeded);
    setDirty(false);
    setEditSelection(null);
    setIsEditing(true);
  };

  const exitEditing = () => {
    if (dirty && !window.confirm("Quitter sans enregistrer ? Les modifications seront perdues.")) return;
    setIsEditing(false);
    setEditableData(null);
    setEditSelection(null);
  };

  const discardChanges = async () => {
    if (!data) return;
    const seeded = await seedPositionsIfNeeded(clone(data));
    setEditableData(seeded);
    setDirty(false);
    setEditSelection(null);
  };

  const handleSave = async () => {
    if (!editableData || !validation?.valid || !auth.isAuthenticated) return;
    setSaving(true);
    try {
      await saveMechanismData(editableData);
      setData(editableData);
      setDirty(false);
      setMessage({ text: "Enregistré.", error: false });
    } catch (cause) {
      setMessage({ text: (cause as Error).message, error: true });
    } finally {
      setSaving(false);
      window.setTimeout(() => setMessage(null), 4000);
    }
  };

  const downloadJson = () => {
    if (!editableData || !validation?.valid) return;
    const blob = new Blob([JSON.stringify(editableData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    if (downloadRef.current) {
      downloadRef.current.href = url;
      downloadRef.current.click();
    }
    URL.revokeObjectURL(url);
  };

  const mutate = (updater: (prev: MechanismData) => MechanismData) => {
    setEditableData((prev) => (prev ? updater(prev) : prev));
    setDirty(true);
  };

  const addNode = (kind: NodeKind) => {
    const id = generateId(kind);
    const newNode: GraphNode = {
      id,
      kind,
      title: "Nouveau nœud",
      position: { x: 80, y: 80 + (editableData?.nodes.length ?? 0) * 24 },
      sources: [],
      status: "brouillon",
      ...(kind === "switch"
        ? {
            branches: [
              { key: "branche-1", label: "Branche 1" },
              { key: "branche-2", label: "Branche 2" },
            ],
            defaultBranch: "branche-1",
          }
        : {}),
    };
    mutate((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    setEditSelection({ type: "node", id });
  };

  const patchNode = (id: string, patch: Partial<GraphNode>) => {
    mutate((prev) => ({ ...prev, nodes: prev.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }));
  };

  const deleteNode = (id: string) => {
    mutate((prev) => ({
      nodes: prev.nodes.filter((n) => n.id !== id),
      edges: prev.edges.filter((e) => e.source !== id && e.target !== id),
    }));
    setEditSelection(null);
  };

  const patchEdge = (id: string, patch: Partial<GraphEdge>) => {
    mutate((prev) => ({ ...prev, edges: prev.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  };

  const deleteEdge = (id: string) => {
    mutate((prev) => ({ ...prev, edges: prev.edges.filter((e) => e.id !== id) }));
    setEditSelection(null);
  };

  const handleConnect: OnConnect = (params) => {
    if (!params.source || !params.target) return;
    const newEdge: GraphEdge = {
      id: generateId("e"),
      kind: "causal",
      source: params.source,
      target: params.target,
      nature: "comptable",
      sources: [],
      status: "brouillon",
    };
    mutate((prev) => ({ ...prev, edges: [...prev.edges, newEdge] }));
    setEditSelection({ type: "edge", id: newEdge.id });
  };

  const handleNodesChange: OnNodesChange = (changes) => {
    if (!isEditing) return;
    let touched = false;
    setEditableData((prev) => {
      if (!prev) return prev;
      let nodes = prev.nodes;
      const removedIds: string[] = [];
      for (const change of changes) {
        if (change.type === "position" && change.position) {
          touched = true;
          nodes = nodes.map((n) => (n.id === change.id ? { ...n, position: change.position! } : n));
        } else if (change.type === "remove") {
          removedIds.push(change.id);
        }
      }
      if (removedIds.length > 0) {
        touched = true;
        nodes = nodes.filter((n) => !removedIds.includes(n.id));
        const edges = prev.edges.filter((e) => !removedIds.includes(e.source) && !removedIds.includes(e.target));
        return { nodes, edges };
      }
      return nodes === prev.nodes ? prev : { ...prev, nodes };
    });
    if (touched) setDirty(true);
  };

  const handleEdgesChange: OnEdgesChange = (changes) => {
    if (!isEditing) return;
    let touched = false;
    setEditableData((prev) => {
      if (!prev) return prev;
      let edges = prev.edges;
      for (const change of changes) {
        if (change.type === "remove") {
          touched = true;
          edges = edges.filter((e) => e.id !== change.id);
        }
      }
      return edges === prev.edges ? prev : { ...prev, edges };
    });
    if (touched) setDirty(true);
  };

  if (dataState.status === "loading" && !data) {
    return <div className="app__loading">Chargement des données…</div>;
  }
  if (dataState.status === "error" && !data) {
    return <div className="app__loading app__loading--error">Impossible de charger les données : {dataState.message}</div>;
  }
  if (!graph || !activeData) return null;
  const layoutReady = isEditing || positions.size > 0;

  const flowNodes: Node[] = graph.nodes.map((graphNode) => {
    const position = positions.get(graphNode.id) ?? { x: 0, y: 0, width: NODE_WIDTH, height: NODE_HEIGHT };
    const dimmed = isEditing ? false : !graph.reachable.has(graphNode.id);

    if (graphNode.kind === "switch") {
      const nodeData: SwitchNodeData = {
        graphNode,
        activeBranch: switchStates[graphNode.id] ?? graphNode.defaultBranch ?? "",
        onToggle: onToggleSwitch,
      };
      return { id: graphNode.id, type: "switch", position, data: nodeData, draggable: isEditing };
    }

    const nodeData: MesureNodeData | VariableNodeData | CompteNodeData | GenericNodeData = { graphNode, dimmed };
    return { id: graphNode.id, type: graphNode.kind, position, data: nodeData, draggable: isEditing };
  });

  const flowEdges: Edge[] = graph.edges.map((edge) => {
    const edgeData: MechanismEdgeData = {
      kind: edge.kind,
      sign: edge.sign,
      nature: edge.nature,
      active: isEditing || edge.active,
      status: edge.status,
      amountUnchiffered: Boolean(edge.amount?.provisional),
      animate: isAnimating && !isEditing,
    };
    return { id: edge.id, source: edge.source, target: edge.target, type: "mechanism", data: edgeData };
  });

  const handleNodeClick = (_: unknown, node: Node) => {
    if (isEditing) {
      setEditSelection({ type: "node", id: node.id });
      return;
    }
    const graphNode = graph.nodes.find((n) => n.id === node.id);
    if (!graphNode) return;
    setSelection({ type: "node", node: graphNode });
  };

  const handleEdgeClick = (_: unknown, edge: Edge) => {
    if (isEditing) {
      setEditSelection({ type: "edge", id: edge.id });
      return;
    }
    const original = activeData.edges.find((e) => e.id === edge.id);
    if (!original) return;
    setSelection({
      type: "edge",
      edge: original,
      sourceTitle: nodeTitleLookup.get(original.source) ?? original.source,
      targetTitle: nodeTitleLookup.get(original.target) ?? original.target,
    });
  };

  const clearSelection = () => {
    if (isEditing) setEditSelection(null);
    else setSelection(null);
  };

  const selectedNode = editSelection?.type === "node" ? editableData?.nodes.find((n) => n.id === editSelection.id) : undefined;
  const selectedEdge = editSelection?.type === "edge" ? editableData?.edges.find((e) => e.id === editSelection.id) : undefined;

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
        <div className="app__header-actions">
          <button type="button" className="app__animate-toggle" onClick={() => setIsAnimating((v) => !v)} disabled={isEditing}>
            {isAnimating ? "Arrêter la propagation" : "Lancer la propagation"}
          </button>
        </div>
      </header>
      <div className="app__body">
        <div className="app__canvas">
          {isEditing ? (
            <EditToolbar
              onAddNode={addNode}
              onSave={handleSave}
              saving={saving}
              onDownload={downloadJson}
              onDiscard={discardChanges}
              onExit={exitEditing}
              valid={validation?.valid ?? false}
              errorCount={validation?.errors.length ?? 0}
            />
          ) : auth.isAuthenticated ? (
            <div className="canvas-auth-bar">
              <button type="button" className="canvas-edit-button" onClick={startEditing}>
                Éditer les données
              </button>
              <span className="canvas-auth-status">
                Connecté : {auth.email} · <button type="button" className="link-button" onClick={() => auth.signOut()}>Se déconnecter</button>
              </span>
            </div>
          ) : (
            <button type="button" className="canvas-edit-button" onClick={() => auth.signInWithGoogle()} disabled={auth.loading}>
              Se connecter avec Google pour éditer
            </button>
          )}
          {message && <div className={`edit__toast${message.error ? " edit__toast--error" : ""}`}>{message.text}</div>}
          {layoutReady ? (
            <ReactFlow
              key={isEditing ? "edit" : "view"}
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              onPaneClick={clearSelection}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              fitView
              nodesDraggable={isEditing}
              nodesConnectable={isEditing}
              deleteKeyCode={isEditing ? ["Backspace", "Delete"] : null}
              elementsSelectable
              proOptions={{ hideAttribution: true }}
            >
              <Background />
              <Controls showInteractive={false} />
            </ReactFlow>
          ) : (
            <div className="app__loading">Disposition du schéma…</div>
          )}
          {!isEditing && <Legend />}
          <a ref={downloadRef} download="smic-mecanisme.json" hidden>
            télécharger
          </a>
        </div>
        {isEditing ? (
          selectedNode ? (
            <NodeInspector node={selectedNode} onChange={(patch) => patchNode(selectedNode.id, patch)} onDelete={() => deleteNode(selectedNode.id)} />
          ) : selectedEdge ? (
            <EdgeInspector
              edge={selectedEdge}
              nodes={editableData?.nodes ?? []}
              onChange={(patch) => patchEdge(selectedEdge.id, patch)}
              onDelete={() => deleteEdge(selectedEdge.id)}
            />
          ) : (
            validation && <ValidationReport result={validation} />
          )
        ) : (
          <SidePanel selection={selection} onClose={() => setSelection(null)} />
        )}
      </div>
    </div>
  );
}
