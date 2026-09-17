import type { SourceRef } from "../types";

const DOCUMENTS: SourceRef["document"][] = ["programme", "chiffrage", "autre"];

/** Éditeur de la liste `sources` commune aux nœuds et aux arêtes (règle §10.1 : au moins une source). */
export function SourceListEditor({
  sources,
  onChange,
}: {
  sources: SourceRef[];
  onChange: (next: SourceRef[]) => void;
}) {
  const update = (i: number, patch: Partial<SourceRef>) => {
    onChange(sources.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };
  const remove = (i: number) => onChange(sources.filter((_, idx) => idx !== i));
  const add = () => onChange([...sources, { document: "autre", edition: "" }]);

  return (
    <div className="field">
      <div className="field__label-row">
        <label>Sources</label>
        <button type="button" className="inspector__mini-button" onClick={add}>
          + source
        </button>
      </div>
      {sources.length === 0 && <p className="inspector__hint">Au moins une source est requise.</p>}
      {sources.map((source, i) => (
        <div key={i} className="source-item">
          <div className="source-item__row">
            <select value={source.document} onChange={(e) => update(i, { document: e.target.value as SourceRef["document"] })}>
              {DOCUMENTS.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
            <input
              placeholder="édition (ex. AEC-2025)"
              value={source.edition}
              onChange={(e) => update(i, { edition: e.target.value })}
            />
            <button type="button" className="inspector__mini-button inspector__mini-button--danger" onClick={() => remove(i)}>
              ×
            </button>
          </div>
          <input
            placeholder="locator (chapitre, section…)"
            value={source.locator ?? ""}
            onChange={(e) => update(i, { locator: e.target.value || undefined })}
          />
          <input placeholder="url" value={source.url ?? ""} onChange={(e) => update(i, { url: e.target.value || undefined })} />
          <textarea
            placeholder="note"
            value={source.note ?? ""}
            onChange={(e) => update(i, { note: e.target.value || undefined })}
          />
        </div>
      ))}
    </div>
  );
}
