import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DRAFT_STORAGE_KEY, fetchPublishedMechanismData } from "./data/mechanismData";
import { validateMechanismData, type ValidationResult } from "./data/validateMechanismData";

type LoadState = "loading" | "ready" | "error";

const emptyResult: ValidationResult = { valid: false, errors: [], warnings: [], data: null };

export default function EditView() {
  const [text, setText] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<ValidationResult>(emptyResult);
  const [hasDraft, setHasDraft] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const draft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft) {
      setText(draft);
      setHasDraft(true);
      setLoadState("ready");
      return;
    }
    fetchPublishedMechanismData()
      .then((data) => {
        setText(JSON.stringify(data, null, 2));
        setLoadState("ready");
      })
      .catch((cause: Error) => {
        setLoadError(cause.message);
        setLoadState("error");
      });
  }, []);

  useEffect(() => {
    if (loadState !== "ready") return;
    try {
      const parsed = JSON.parse(text);
      setParseError(null);
      setResult(validateMechanismData(parsed));
    } catch (cause) {
      setParseError((cause as Error).message);
      setResult(emptyResult);
    }
  }, [text, loadState]);

  const saveDraft = () => {
    if (!result.valid) return;
    window.localStorage.setItem(DRAFT_STORAGE_KEY, text);
    setHasDraft(true);
    setMessage("Brouillon enregistré dans ce navigateur. Ouvre la carte pour la prévisualiser.");
  };

  const discardDraft = () => {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    setMessage("Brouillon supprimé. Rechargement des données publiées…");
    fetchPublishedMechanismData().then((data) => setText(JSON.stringify(data, null, 2)));
  };

  const reloadPublished = () => {
    if (hasDraft && !window.confirm("Recharger les données publiées écrasera le texte affiché (le brouillon enregistré n'est pas perdu tant que tu ne cliques pas sur Enregistrer). Continuer ?")) {
      return;
    }
    fetchPublishedMechanismData().then((data) => {
      setText(JSON.stringify(data, null, 2));
      setMessage("Données publiées rechargées dans l'éditeur.");
    });
  };

  const download = () => {
    if (!result.valid) return;
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    if (downloadRef.current) {
      downloadRef.current.href = url;
      downloadRef.current.click();
    }
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setMessage("JSON copié dans le presse-papiers.");
  };

  if (loadState === "loading") {
    return <div className="app__loading">Chargement des données…</div>;
  }
  if (loadState === "error") {
    return <div className="app__loading app__loading--error">Impossible de charger les données : {loadError}</div>;
  }

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Éditer les données du mécanisme</h1>
          <p className="app__subtitle">
            JSON brut, validé en direct contre le schéma du §10. Le brouillon reste local à ce navigateur (aucune
            écriture sur GitHub) — <Link to="/">retour à la carte</Link>.
          </p>
        </div>
        <div className="app__header-actions">
          <Link to="/" className="app__animate-toggle">
            Voir la carte
          </Link>
        </div>
      </header>
      <div className="edit__body">
        <div className="edit__editor">
          <textarea
            className="edit__textarea"
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="edit__actions">
            <button type="button" onClick={saveDraft} disabled={!result.valid} className="app__animate-toggle">
              Enregistrer comme brouillon local
            </button>
            <button type="button" onClick={download} disabled={!result.valid} className="app__animate-toggle">
              Télécharger le JSON
            </button>
            <button type="button" onClick={copyToClipboard} className="app__animate-toggle">
              Copier
            </button>
            <button type="button" onClick={reloadPublished} className="app__animate-toggle">
              Recharger les données publiées
            </button>
            {hasDraft && (
              <button type="button" onClick={discardDraft} className="app__animate-toggle app__animate-toggle--danger">
                Supprimer le brouillon
              </button>
            )}
          </div>
          {message && <p className="edit__message">{message}</p>}
          {/* Lien invisible utilisé par download() pour déclencher le téléchargement du fichier. */}
          <a ref={downloadRef} download="smic-mecanisme.json" hidden>
            télécharger
          </a>
        </div>
        <aside className="edit__report">
          <h2>Validation</h2>
          {parseError ? (
            <p className="edit__error">JSON invalide : {parseError}</p>
          ) : (
            <>
              <p className={result.valid ? "edit__valid" : "edit__invalid"}>
                {result.valid
                  ? `Valide — ${result.data?.nodes.length} nœuds (dont ${
                      result.data?.nodes.filter((n) => n.kind === "switch").length
                    } aiguillage(s)), ${result.data?.edges.length} arêtes.`
                  : `${result.errors.length} erreur(s) bloquante(s).`}
              </p>
              {result.errors.length > 0 && (
                <div className="edit__issues">
                  <h3>Erreurs</h3>
                  <ul>
                    {result.errors.map((issue, i) => (
                      <li key={i}>
                        <code>{issue.path}</code> {issue.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.warnings.length > 0 && (
                <div className="edit__issues edit__issues--warning">
                  <h3>Avertissements</h3>
                  <ul>
                    {result.warnings.map((issue, i) => (
                      <li key={i}>
                        <code>{issue.path}</code> {issue.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          <div className="edit__help">
            <h3>Pour publier un brouillon</h3>
            <ol>
              <li>Enregistre le brouillon pour le prévisualiser sur la carte.</li>
              <li>Une fois satisfait, télécharge le JSON.</li>
              <li>
                Remplace <code>public/data/smic-mecanisme.json</code> dans le dépôt par ce fichier et pousse sur{" "}
                <code>main</code> — Vercel redéploiera automatiquement.
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
