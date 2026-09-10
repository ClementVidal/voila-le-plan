export type Id = string;

export type SourceRef = {
  document: "programme" | "chiffrage" | "autre";
  edition: string; // ex. "AEC-2025", "chiffrage-2022"
  url?: string; // ex. https://melenchon2027.fr/programme2025/livre/chapitre8
  locator?: string; // chapitre / section / page
  note?: string;
};

export type ValidationStatus = "brouillon" | "interpretation" | "valide_lfi";

export type NodeKind =
  | "partie"
  | "chapitre"
  | "section"
  | "mesure"
  | "variable"
  | "compte_public"
  | "acteur"
  | "principe";

export type GraphNode = {
  id: Id;
  kind: NodeKind;
  title: string; // court : affiché sur le nœud
  summary?: string; // affiché dans le panneau
  parentId?: Id; // appartenance (section, chapitre…)
  position: { x: number; y: number }; // layout carte, persisté
  sources: SourceRef[];
  status: ValidationStatus;
};

export type Amount = {
  unit: "Md€/an" | "logements" | "emplois" | string;
  // Une valeur par année ; la v1 ne remplit que "croisiere".
  values: Partial<Record<"croisiere" | `${number}`, number | null>>;
  reference: string; // ex. "euros constants 20XX, régime de croisière"
  provisional: boolean; // true tant que le chiffrage n'est pas celui de l'édition courante
};

export type EdgeKind =
  | "contribution"
  | "dependance"
  | "causal"
  | "flux_financier"
  | "conditionnel"
  | "verrou"
  | "flux_non_monetaire";

export type GraphEdge = {
  id: Id;
  kind: EdgeKind;
  source: Id;
  target: Id;
  sign?: "+" | "-";
  nature: "comptable" | "hypothese"; // trait plein / pointillé
  amount?: Amount;
  condition?: { switchId: Id; branch: "respect" | "non_respect" | string };
  sources: SourceRef[];
  status: ValidationStatus;
};

export type Switch = {
  // aiguillage conditionnel
  id: Id;
  label: string; // ex. "L'entreprise augmente les salaires ?"
  branches: { key: string; label: string }[];
  defaultBranch: string;
};
