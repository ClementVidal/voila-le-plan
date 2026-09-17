import { useState } from "react";
import type { NodeKind } from "../types";

const NODE_KINDS: NodeKind[] = [
  "mesure",
  "variable",
  "compte_public",
  "switch",
  "acteur",
  "principe",
  "partie",
  "chapitre",
  "section",
];

export function EditToolbar({
  onAddNode,
  onSave,
  saving,
  onDownload,
  onDiscard,
  onExit,
  valid,
  errorCount,
}: {
  onAddNode: (kind: NodeKind) => void;
  onSave: () => void;
  saving: boolean;
  onDownload: () => void;
  onDiscard: () => void;
  onExit: () => void;
  valid: boolean;
  errorCount: number;
}) {
  const [pendingKind, setPendingKind] = useState<NodeKind>("mesure");

  return (
    <div className="edit-toolbar">
      <div className="edit-toolbar__group">
        <select value={pendingKind} onChange={(e) => setPendingKind(e.target.value as NodeKind)}>
          {NODE_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
        <button type="button" className="app__animate-toggle" onClick={() => onAddNode(pendingKind)}>
          + Ajouter un nœud
        </button>
      </div>
      <div className="edit-toolbar__group">
        <span className={valid ? "edit__valid" : "edit__invalid"}>{valid ? "Valide" : `${errorCount} erreur(s)`}</span>
        <button type="button" className="app__animate-toggle" onClick={onSave} disabled={!valid || saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button type="button" className="app__animate-toggle" onClick={onDownload} disabled={!valid}>
          Télécharger le JSON
        </button>
        <button type="button" className="app__animate-toggle" onClick={onDiscard}>
          Annuler les modifications
        </button>
        <button type="button" className="app__animate-toggle app__animate-toggle--danger" onClick={onExit}>
          Quitter l'édition
        </button>
      </div>
    </div>
  );
}
