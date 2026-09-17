import type { ValidationResult } from "../data/validateMechanismData";

export function ValidationReport({ result }: { result: ValidationResult }) {
  return (
    <div className="inspector">
      <div className="inspector__kind">Validation</div>
      <p className={result.valid ? "edit__valid" : "edit__invalid"}>
        {result.valid
          ? `Valide — ${result.data?.nodes.length} nœuds, ${result.data?.edges.length} arêtes.`
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
      <p className="inspector__hint">Clique sur un nœud ou une arête du canevas pour l'éditer.</p>
    </div>
  );
}
