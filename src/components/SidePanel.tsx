import type { GraphEdge, GraphNode } from "../types";
import { StatusBadge } from "./StatusBadge";

export type Selection =
  | { type: "node"; node: GraphNode }
  | { type: "edge"; edge: GraphEdge; sourceTitle: string; targetTitle: string };

export function SidePanel({ selection, onClose }: { selection: Selection | null; onClose: () => void }) {
  if (!selection) {
    return (
      <aside className="side-panel side-panel--empty">
        <p>Sélectionnez un nœud ou une flèche pour voir son détail et ses sources.</p>
      </aside>
    );
  }

  return (
    <aside className="side-panel">
      <button type="button" className="side-panel__close" onClick={onClose} aria-label="Fermer">
        ×
      </button>
      {selection.type === "node" ? <NodeDetail node={selection.node} /> : <EdgeDetail {...selection} />}
    </aside>
  );
}

function NodeDetail({ node }: { node: GraphNode }) {
  return (
    <div>
      <div className="side-panel__kind">{node.kind}</div>
      <h2 className="side-panel__title">{node.title}</h2>
      <StatusBadge status={node.status} />
      {node.summary && <p className="side-panel__summary">{node.summary}</p>}
      <SourceList sources={node.sources} />
    </div>
  );
}

function EdgeDetail({ edge, sourceTitle, targetTitle }: { edge: GraphEdge; sourceTitle: string; targetTitle: string }) {
  return (
    <div>
      <div className="side-panel__kind">{edge.kind}</div>
      <h2 className="side-panel__title">
        {sourceTitle} → {targetTitle}
      </h2>
      <StatusBadge status={edge.status} />
      <dl className="side-panel__facts">
        <dt>Signe</dt>
        <dd>{edge.sign ?? "—"}</dd>
        <dt>Nature</dt>
        <dd>{edge.nature === "comptable" ? "Comptable (trait plein)" : "Hypothèse (pointillé)"}</dd>
        {edge.amount && (
          <>
            <dt>Montant</dt>
            <dd>
              {edge.amount.values.croisiere ?? "non chiffré"} {edge.amount.unit}
              {edge.amount.provisional && <span className="side-panel__provisional"> (provisoire)</span>}
            </dd>
            <dt>Référence</dt>
            <dd>{edge.amount.reference}</dd>
          </>
        )}
        {edge.condition && (
          <>
            <dt>Branche</dt>
            <dd>{edge.condition.branch}</dd>
          </>
        )}
      </dl>
      <SourceList sources={edge.sources} />
    </div>
  );
}

function SourceList({ sources }: { sources: GraphNode["sources"] }) {
  if (sources.length === 0) {
    return <p className="side-panel__no-source">Élément de mise en forme, sans source propre.</p>;
  }
  return (
    <div className="side-panel__sources">
      <h3>Sources</h3>
      <ul>
        {sources.map((source, index) => (
          <li key={index}>
            <div className="side-panel__source-header">
              <strong>{source.document}</strong> · {source.edition}
              {source.locator && <span> · {source.locator}</span>}
            </div>
            {source.note && <p className="side-panel__source-note">{source.note}</p>}
            {source.url && (
              <a href={source.url} target="_blank" rel="noreferrer">
                Voir le texte du programme
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
