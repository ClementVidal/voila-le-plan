import type { GraphNode, NodeKind, SwitchBranch, ValidationStatus } from "../types";
import { SourceListEditor } from "./SourceListEditor";

const NODE_KINDS: NodeKind[] = [
  "partie",
  "chapitre",
  "section",
  "mesure",
  "variable",
  "compte_public",
  "acteur",
  "principe",
  "switch",
];
const STATUSES: ValidationStatus[] = ["brouillon", "interpretation", "valide_lfi"];

export function NodeInspector({
  node,
  onChange,
  onDelete,
}: {
  node: GraphNode;
  onChange: (patch: Partial<GraphNode>) => void;
  onDelete: () => void;
}) {
  const branches = node.branches ?? [];

  const updateBranch = (i: number, patch: Partial<SwitchBranch>) => {
    onChange({ branches: branches.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) });
  };
  const removeBranch = (i: number) => {
    const next = branches.filter((_, idx) => idx !== i);
    onChange({ branches: next, defaultBranch: next.some((b) => b.key === node.defaultBranch) ? node.defaultBranch : next[0]?.key });
  };
  const addBranch = () => {
    onChange({ branches: [...branches, { key: `branche-${branches.length + 1}`, label: "Nouvelle branche" }] });
  };

  return (
    <div className="inspector">
      <div className="inspector__kind">Nœud</div>
      <div className="field">
        <label>Type</label>
        <select value={node.kind} onChange={(e) => onChange({ kind: e.target.value as NodeKind })}>
          {NODE_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Titre</label>
        <input value={node.title} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      <div className="field">
        <label>Résumé</label>
        <textarea value={node.summary ?? ""} onChange={(e) => onChange({ summary: e.target.value || undefined })} />
      </div>
      <div className="field">
        <label>Statut</label>
        <select value={node.status} onChange={(e) => onChange({ status: e.target.value as ValidationStatus })}>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {node.kind === "switch" && (
        <div className="field">
          <div className="field__label-row">
            <label>Branches de l'aiguillage</label>
            <button type="button" className="inspector__mini-button" onClick={addBranch}>
              + branche
            </button>
          </div>
          {branches.map((branch, i) => (
            <div key={i} className="source-item__row">
              <input
                placeholder="clé"
                value={branch.key}
                onChange={(e) => updateBranch(i, { key: e.target.value })}
                style={{ maxWidth: "35%" }}
              />
              <input placeholder="libellé" value={branch.label} onChange={(e) => updateBranch(i, { label: e.target.value })} />
              <button type="button" className="inspector__mini-button inspector__mini-button--danger" onClick={() => removeBranch(i)}>
                ×
              </button>
            </div>
          ))}
          <label style={{ marginTop: 8 }}>Branche par défaut</label>
          <select value={node.defaultBranch ?? ""} onChange={(e) => onChange({ defaultBranch: e.target.value })}>
            {branches.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label} ({b.key})
              </option>
            ))}
          </select>
        </div>
      )}

      <SourceListEditor sources={node.sources} onChange={(sources) => onChange({ sources })} />

      <button type="button" className="app__animate-toggle app__animate-toggle--danger inspector__delete" onClick={onDelete}>
        Supprimer ce nœud
      </button>
    </div>
  );
}
