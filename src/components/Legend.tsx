export function Legend() {
  return (
    <div className="legend">
      <div className="legend__row">
        <span className="legend__line legend__line--solid" style={{ borderColor: "var(--sign-positive)" }} />
        Effet comptable (+)
      </div>
      <div className="legend__row">
        <span className="legend__line legend__line--solid" style={{ borderColor: "var(--sign-negative)" }} />
        Effet comptable (−, dépense)
      </div>
      <div className="legend__row">
        <span className="legend__line legend__line--dashed" />
        Lien structurel / hypothèse
      </div>
      <div className="legend__row">
        <span className="legend__dim-sample" />
        Branche inactive de l'aiguillage
      </div>
    </div>
  );
}
