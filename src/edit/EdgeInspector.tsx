import type { Amount, EdgeKind, GraphEdge, GraphNode, ValidationStatus } from "../types";
import { SourceListEditor } from "./SourceListEditor";

const EDGE_KINDS: EdgeKind[] = [
  "contribution",
  "dependance",
  "causal",
  "flux_financier",
  "conditionnel",
  "verrou",
  "flux_non_monetaire",
];
const STATUSES: ValidationStatus[] = ["brouillon", "interpretation", "valide_lfi"];

const emptyAmount = (): Amount => ({ unit: "Md€/an", values: { croisiere: null }, reference: "", provisional: true });

export function EdgeInspector({
  edge,
  nodes,
  onChange,
  onDelete,
}: {
  edge: GraphEdge;
  nodes: GraphNode[];
  onChange: (patch: Partial<GraphEdge>) => void;
  onDelete: () => void;
}) {
  const switchNodes = nodes.filter((n) => n.kind === "switch");
  const conditionSwitch = switchNodes.find((n) => n.id === edge.condition?.switchId);

  return (
    <div className="inspector">
      <div className="inspector__kind">Arête</div>
      <div className="field">
        <label>Type</label>
        <select value={edge.kind} onChange={(e) => onChange({ kind: e.target.value as EdgeKind })}>
          {EDGE_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Source</label>
        <select value={edge.source} onChange={(e) => onChange({ source: e.target.value })}>
          {nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Cible</label>
        <select value={edge.target} onChange={(e) => onChange({ target: e.target.value })}>
          {nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Signe</label>
        <select value={edge.sign ?? ""} onChange={(e) => onChange({ sign: (e.target.value || undefined) as "+" | "-" | undefined })}>
          <option value="">—</option>
          <option value="+">+</option>
          <option value="-">-</option>
        </select>
      </div>
      <div className="field">
        <label>Nature</label>
        <select value={edge.nature} onChange={(e) => onChange({ nature: e.target.value as GraphEdge["nature"] })}>
          <option value="comptable">comptable (trait plein)</option>
          <option value="hypothese">hypothèse (pointillé)</option>
        </select>
      </div>
      <div className="field">
        <label>Statut</label>
        <select value={edge.status} onChange={(e) => onChange({ status: e.target.value as ValidationStatus })}>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__checkbox">
          <input
            type="checkbox"
            checked={Boolean(edge.amount)}
            onChange={(e) => onChange({ amount: e.target.checked ? emptyAmount() : undefined })}
          />
          Montant chiffré (flux_financier)
        </label>
        {edge.amount && (
          <div className="source-item">
            <input
              placeholder="unité (ex. Md€/an)"
              value={edge.amount.unit}
              onChange={(e) => onChange({ amount: { ...edge.amount!, unit: e.target.value } })}
            />
            <input
              placeholder="valeur en régime de croisière (laisser vide si non chiffré)"
              type="number"
              value={edge.amount.values.croisiere ?? ""}
              onChange={(e) =>
                onChange({
                  amount: {
                    ...edge.amount!,
                    values: { ...edge.amount!.values, croisiere: e.target.value === "" ? null : Number(e.target.value) },
                  },
                })
              }
            />
            <textarea
              placeholder="référence (année, convention)"
              value={edge.amount.reference}
              onChange={(e) => onChange({ amount: { ...edge.amount!, reference: e.target.value } })}
            />
            <label className="field__checkbox">
              <input
                type="checkbox"
                checked={edge.amount.provisional}
                onChange={(e) => onChange({ amount: { ...edge.amount!, provisional: e.target.checked } })}
              />
              Provisoire
            </label>
          </div>
        )}
      </div>

      <div className="field">
        <label className="field__checkbox">
          <input
            type="checkbox"
            checked={Boolean(edge.condition)}
            onChange={(e) =>
              onChange({
                condition: e.target.checked
                  ? { switchId: switchNodes[0]?.id ?? "", branch: switchNodes[0]?.branches?.[0]?.key ?? "" }
                  : undefined,
              })
            }
          />
          Conditionnée par un aiguillage
        </label>
        {edge.condition && (
          <div className="source-item">
            {switchNodes.length === 0 ? (
              <p className="inspector__hint">Aucun nœud switch dans le graphe — ajoute-en un d'abord.</p>
            ) : (
              <>
                <select
                  value={edge.condition.switchId}
                  onChange={(e) =>
                    onChange({ condition: { switchId: e.target.value, branch: nodes.find((n) => n.id === e.target.value)?.branches?.[0]?.key ?? "" } })
                  }
                >
                  {switchNodes.map((sw) => (
                    <option key={sw.id} value={sw.id}>
                      {sw.title}
                    </option>
                  ))}
                </select>
                <select
                  value={edge.condition.branch}
                  onChange={(e) => onChange({ condition: { switchId: edge.condition!.switchId, branch: e.target.value } })}
                >
                  {(conditionSwitch?.branches ?? []).map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.label} ({b.key})
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}
      </div>

      <SourceListEditor sources={edge.sources} onChange={(sources) => onChange({ sources })} />

      <button type="button" className="app__animate-toggle app__animate-toggle--danger inspector__delete" onClick={onDelete}>
        Supprimer cette arête
      </button>
    </div>
  );
}
