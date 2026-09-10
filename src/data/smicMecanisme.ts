import type { GraphEdge, GraphNode, Switch } from "../types";

/**
 * Données du prototype de référence décrit au §11 du document de passation :
 * le mécanisme SMIC, qui concentre effet retour, aiguillage conditionnel et
 * cascade d'indexation.
 *
 * `position` est requis par le schéma (usage futur : vue carte, §8) mais
 * n'est pas utilisé ici : la vue mécanisme calcule sa disposition avec ELK
 * à chaque rendu (§9).
 *
 * Aucun montant n'est inventé : tous les `values` restent `null` et
 * `provisional: true` tant qu'aucun document de chiffrage identifié ne les
 * couvre (consigne §14.1).
 */

const NO_LAYOUT_POSITION = { x: 0, y: 0 };

export const smicSwitches: Switch[] = [
  {
    id: "switch-respect-hausse",
    label: "L'entreprise applique la hausse du SMIC ?",
    branches: [
      { key: "respect", label: "Respecte la hausse" },
      { key: "non_respect", label: "Ne respecte pas la hausse" },
    ],
    defaultBranch: "respect",
  },
];

export const smicNodes: GraphNode[] = [
  {
    id: "mesure-smic",
    kind: "mesure",
    title: "SMIC à 1 600 € net",
    summary:
      "Relèvement du salaire minimum interprofessionnel de croissance à 1 600 € nets par mois.",
    position: NO_LAYOUT_POSITION,
    sources: [
      {
        document: "programme",
        edition: "AEC-2025",
        url: "https://melenchon2027.fr/programme2025/livre/chapitre8",
        locator: "chapitre 8",
        note: "Mesure confirmée sur le site officiel du programme.",
      },
    ],
    status: "brouillon",
  },
  {
    id: "var-masse-salariale",
    kind: "variable",
    title: "Masse salariale",
    summary:
      "Somme des salaires bruts versés par les entreprises. Transmet l'effet de la hausse du SMIC sans être elle-même comptabilisée dans un solde public.",
    position: NO_LAYOUT_POSITION,
    sources: [
      {
        document: "autre",
        edition: "modele-interne",
        note: "Variable de modélisation ; ne provient pas directement du texte du programme.",
      },
    ],
    status: "brouillon",
  },
  {
    id: "var-cotisations",
    kind: "variable",
    title: "Cotisations sociales",
    summary:
      "Prélèvements assis sur la masse salariale qui financent les régimes de sécurité sociale.",
    position: NO_LAYOUT_POSITION,
    sources: [
      {
        document: "autre",
        edition: "modele-interne",
        note: "Variable de modélisation.",
      },
    ],
    status: "brouillon",
  },
  {
    id: "mesure-perte-exoneration",
    kind: "mesure",
    title: "Perte des exonérations de cotisations",
    summary:
      "Une entreprise qui ne respecte pas la hausse de salaire perd le bénéfice de ses exonérations de cotisations sociales : elle en paie davantage.",
    position: NO_LAYOUT_POSITION,
    sources: [
      {
        document: "programme",
        edition: "AEC-2025",
        locator: "chapitre 8 (passage exact à confirmer)",
        note: "⚠️ Passage exact du programme à sourcer précisément — voir §13 du document de passation.",
      },
    ],
    status: "brouillon",
  },
  {
    id: "mesure-pensions",
    kind: "mesure",
    title: "Pensions de carrière complète ≥ SMIC revalorisé",
    summary:
      "Les pensions de retraite à carrière complète sont portées au minimum au niveau du SMIC revalorisé.",
    position: NO_LAYOUT_POSITION,
    sources: [
      {
        document: "programme",
        edition: "AEC-2025",
        url: "https://melenchon2027.fr/programme2025/livre/chapitre8",
        locator: "chapitre 8",
      },
    ],
    status: "brouillon",
  },
  {
    id: "compte-secu",
    kind: "compte_public",
    title: "Sécurité sociale",
    summary:
      "Compte public regroupant les caisses de sécurité sociale (maladie, retraite, famille…). Seuls les flux qui entrent dans ce compte sont comptabilisés dans son solde, pour éviter tout double comptage (§6).",
    position: NO_LAYOUT_POSITION,
    sources: [
      {
        document: "autre",
        edition: "modele-interne",
        note: "Regroupement des régimes de sécurité sociale pour la modélisation du solde.",
      },
    ],
    status: "brouillon",
  },
];

export const smicEdges: GraphEdge[] = [
  {
    id: "e-smic-vers-masse-salariale",
    kind: "conditionnel",
    source: "mesure-smic",
    target: "var-masse-salariale",
    sign: "+",
    nature: "comptable",
    condition: { switchId: "switch-respect-hausse", branch: "respect" },
    sources: [
      {
        document: "autre",
        edition: "modele-interne",
        note: "Lien non écrit explicitement dans le texte, formulé par l'équipe de modélisation (§5, motif 2).",
      },
    ],
    status: "interpretation",
  },
  {
    id: "e-smic-vers-perte-exoneration",
    kind: "conditionnel",
    source: "mesure-smic",
    target: "mesure-perte-exoneration",
    sign: "+",
    nature: "comptable",
    condition: { switchId: "switch-respect-hausse", branch: "non_respect" },
    sources: [
      {
        document: "autre",
        edition: "modele-interne",
        note: "Lien non écrit explicitement dans le texte, formulé par l'équipe de modélisation (§5, motif 2).",
      },
    ],
    status: "interpretation",
  },
  {
    id: "e-masse-salariale-vers-cotisations",
    kind: "causal",
    source: "var-masse-salariale",
    target: "var-cotisations",
    sign: "+",
    nature: "comptable",
    sources: [
      {
        document: "autre",
        edition: "modele-interne",
        note: "Identité comptable (les cotisations sont assises sur la masse salariale), non écrite telle quelle dans le texte.",
      },
    ],
    status: "interpretation",
  },
  {
    id: "e-cotisations-vers-secu",
    kind: "flux_financier",
    source: "var-cotisations",
    target: "compte-secu",
    sign: "+",
    nature: "comptable",
    amount: {
      unit: "Md€/an",
      values: { croisiere: null },
      reference:
        "euros constants, régime de croisière — à préciser dès qu'un chiffrage aligné sur l'édition en cours sera disponible",
      provisional: true,
    },
    sources: [
      {
        document: "autre",
        edition: "modele-interne",
        note: "Lien non écrit explicitement dans le texte, formulé par l'équipe de modélisation (§5, motif 1 : « Salaires → Sécu »).",
      },
    ],
    status: "interpretation",
  },
  {
    id: "e-perte-exoneration-vers-secu",
    kind: "flux_financier",
    source: "mesure-perte-exoneration",
    target: "compte-secu",
    sign: "+",
    nature: "comptable",
    amount: {
      unit: "Md€/an",
      values: { croisiere: null },
      reference:
        "euros constants, régime de croisière — à préciser dès qu'un chiffrage aligné sur l'édition en cours sera disponible",
      provisional: true,
    },
    sources: [
      {
        document: "autre",
        edition: "modele-interne",
        note: "Convergence des deux branches de l'aiguillage vers les recettes de la Sécu (§5, motif 2).",
      },
    ],
    status: "interpretation",
  },
  {
    id: "e-smic-vers-pensions",
    kind: "causal",
    source: "mesure-smic",
    target: "mesure-pensions",
    sign: "+",
    nature: "comptable",
    sources: [
      {
        document: "autre",
        edition: "modele-interne",
        note: "Cascade d'indexation : la hausse du SMIC revalorise le plancher des pensions (§5, motif 3).",
      },
    ],
    status: "interpretation",
  },
  {
    id: "e-pensions-vers-secu",
    kind: "flux_financier",
    source: "mesure-pensions",
    target: "compte-secu",
    sign: "-",
    nature: "comptable",
    amount: {
      unit: "Md€/an",
      values: { croisiere: null },
      reference:
        "euros constants, régime de croisière — à préciser dès qu'un chiffrage aligné sur l'édition en cours sera disponible",
      provisional: true,
    },
    sources: [
      {
        document: "autre",
        edition: "modele-interne",
        note: "Dépense induite : le nœud SMIC doit montrer recettes ET dépenses induites (§11, critères de réussite).",
      },
    ],
    status: "interpretation",
  },
];
