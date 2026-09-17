import type { MechanismData } from "./mechanismData";

export type ValidationIssue = { path: string; message: string };

export type ValidationResult = {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  data: MechanismData | null;
};

const NODE_KINDS = ["partie", "chapitre", "section", "mesure", "variable", "compte_public", "acteur", "principe"];
const EDGE_KINDS = ["contribution", "dependance", "causal", "flux_financier", "conditionnel", "verrou", "flux_non_monetaire"];
const VALIDATION_STATUSES = ["brouillon", "interpretation", "valide_lfi"];
const SOURCE_DOCUMENTS = ["programme", "chiffrage", "autre"];
const SIGNS = ["+", "-"];
const NATURES = ["comptable", "hypothese"];

/** Plafond absolu du §7 : jamais plus de 50 nœuds à l'écran. */
const ABSOLUTE_NODE_CEILING = 50;
/** Cible « vue confortable » du §7 : au-delà, avertir sans bloquer. */
const COMFORTABLE_NODE_TARGET = 15;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Valide un JSON candidat par rapport au schéma du §10 du document de
 * passation (`src/types.ts`) et à ses règles de validation. Ne lève jamais :
 * les problèmes sont retournés, pour que `/edit` puisse tous les afficher
 * d'un coup plutôt que un par un.
 */
export function validateMechanismData(raw: unknown): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const err = (path: string, message: string) => errors.push({ path, message });
  const warn = (path: string, message: string) => warnings.push({ path, message });

  if (!isPlainObject(raw)) {
    err("$", "Le document doit être un objet JSON avec les clés nodes, edges, switches.");
    return { valid: false, errors, warnings, data: null };
  }

  const nodesRaw = raw.nodes;
  const edgesRaw = raw.edges;
  const switchesRaw = raw.switches;

  if (!Array.isArray(nodesRaw)) err("$.nodes", "doit être un tableau de GraphNode.");
  if (!Array.isArray(edgesRaw)) err("$.edges", "doit être un tableau de GraphEdge.");
  if (!Array.isArray(switchesRaw)) err("$.switches", "doit être un tableau de Switch.");
  if (errors.length > 0) return { valid: false, errors, warnings, data: null };

  const nodes = nodesRaw as unknown[];
  const edges = edgesRaw as unknown[];
  const switches = switchesRaw as unknown[];

  const nodeIds = new Set<string>();
  const switchIds = new Set<string>();
  const seenIds = new Set<string>();

  const checkSources = (path: string, sources: unknown) => {
    if (!Array.isArray(sources)) {
      err(`${path}.sources`, "doit être un tableau (au moins une source — règle §10.1).");
      return;
    }
    if (sources.length === 0) {
      err(`${path}.sources`, "doit contenir au moins une source (règle §10.1).");
    }
    sources.forEach((source, i) => {
      if (!isPlainObject(source)) {
        err(`${path}.sources[${i}]`, "doit être un objet SourceRef.");
        return;
      }
      if (!SOURCE_DOCUMENTS.includes(source.document as string)) {
        err(`${path}.sources[${i}].document`, `doit être l'un de ${SOURCE_DOCUMENTS.join(", ")}.`);
      }
      if (!isNonEmptyString(source.edition)) {
        err(`${path}.sources[${i}].edition`, "doit être une chaîne non vide.");
      }
    });
  };

  nodes.forEach((node, i) => {
    const path = `$.nodes[${i}]`;
    if (!isPlainObject(node)) {
      err(path, "doit être un objet GraphNode.");
      return;
    }
    if (!isNonEmptyString(node.id)) {
      err(`${path}.id`, "doit être une chaîne non vide.");
    } else {
      if (seenIds.has(node.id)) err(`${path}.id`, `identifiant dupliqué : "${node.id}".`);
      seenIds.add(node.id);
      nodeIds.add(node.id);
    }
    if (!NODE_KINDS.includes(node.kind as string)) {
      err(`${path}.kind`, `doit être l'un de ${NODE_KINDS.join(", ")}.`);
    }
    if (!isNonEmptyString(node.title)) {
      err(`${path}.title`, "doit être une chaîne non vide.");
    }
    if (!VALIDATION_STATUSES.includes(node.status as string)) {
      err(`${path}.status`, `doit être l'un de ${VALIDATION_STATUSES.join(", ")}.`);
    }
    if (
      !isPlainObject(node.position) ||
      typeof node.position.x !== "number" ||
      typeof node.position.y !== "number"
    ) {
      err(`${path}.position`, "doit être { x: number, y: number }.");
    }
    checkSources(path, node.sources);
  });

  switches.forEach((sw, i) => {
    const path = `$.switches[${i}]`;
    if (!isPlainObject(sw)) {
      err(path, "doit être un objet Switch.");
      return;
    }
    if (!isNonEmptyString(sw.id)) {
      err(`${path}.id`, "doit être une chaîne non vide.");
    } else {
      if (seenIds.has(sw.id)) err(`${path}.id`, `identifiant dupliqué : "${sw.id}".`);
      seenIds.add(sw.id);
      switchIds.add(sw.id);
    }
    if (!isNonEmptyString(sw.label)) {
      err(`${path}.label`, "doit être une chaîne non vide.");
    }
    const branches = sw.branches;
    if (!Array.isArray(branches) || branches.length < 2) {
      err(`${path}.branches`, "doit contenir au moins deux branches.");
    } else {
      const keys = new Set<string>();
      branches.forEach((branch, j) => {
        if (!isPlainObject(branch) || !isNonEmptyString(branch.key) || !isNonEmptyString(branch.label)) {
          err(`${path}.branches[${j}]`, "doit être { key: string, label: string }.");
          return;
        }
        keys.add(branch.key as string);
      });
      if (isNonEmptyString(sw.defaultBranch) && !keys.has(sw.defaultBranch)) {
        err(`${path}.defaultBranch`, `référence une branche inexistante : "${sw.defaultBranch}".`);
      }
    }
    if (!isNonEmptyString(sw.defaultBranch)) {
      err(`${path}.defaultBranch`, "doit être une chaîne non vide.");
    }
  });

  edges.forEach((edge, i) => {
    const path = `$.edges[${i}]`;
    if (!isPlainObject(edge)) {
      err(path, "doit être un objet GraphEdge.");
      return;
    }
    if (!isNonEmptyString(edge.id)) {
      err(`${path}.id`, "doit être une chaîne non vide.");
    } else {
      if (seenIds.has(edge.id)) err(`${path}.id`, `identifiant dupliqué : "${edge.id}".`);
      seenIds.add(edge.id);
    }
    if (!EDGE_KINDS.includes(edge.kind as string)) {
      err(`${path}.kind`, `doit être l'un de ${EDGE_KINDS.join(", ")}.`);
    }
    if (!isNonEmptyString(edge.source) || !nodeIds.has(edge.source)) {
      err(`${path}.source`, `doit référencer un nœud existant (reçu : ${JSON.stringify(edge.source)}).`);
    }
    if (!isNonEmptyString(edge.target) || !nodeIds.has(edge.target)) {
      err(`${path}.target`, `doit référencer un nœud existant (reçu : ${JSON.stringify(edge.target)}).`);
    }
    if (edge.sign !== undefined && !SIGNS.includes(edge.sign as string)) {
      err(`${path}.sign`, `doit être "+" ou "-" si présent.`);
    }
    if (!NATURES.includes(edge.nature as string)) {
      err(`${path}.nature`, `doit être l'un de ${NATURES.join(", ")}.`);
    }
    if (!VALIDATION_STATUSES.includes(edge.status as string)) {
      err(`${path}.status`, `doit être l'un de ${VALIDATION_STATUSES.join(", ")}.`);
    }
    checkSources(path, edge.sources);

    if (edge.amount !== undefined) {
      const amount = edge.amount;
      if (!isPlainObject(amount)) {
        err(`${path}.amount`, "doit être un objet Amount.");
      } else {
        if (!isNonEmptyString(amount.unit)) err(`${path}.amount.unit`, "doit être une chaîne non vide (règle §10.2).");
        if (!isPlainObject(amount.values)) err(`${path}.amount.values`, "doit être un objet { croisiere | année: number|null }.");
        if (!isNonEmptyString(amount.reference)) err(`${path}.amount.reference`, "doit être une chaîne non vide (règle §10.2).");
        if (typeof amount.provisional !== "boolean") err(`${path}.amount.provisional`, "doit être un booléen (règle §10.2).");
      }
    }

    if (edge.condition !== undefined) {
      const condition = edge.condition;
      if (!isPlainObject(condition) || !isNonEmptyString(condition.switchId) || !isNonEmptyString(condition.branch)) {
        err(`${path}.condition`, "doit être { switchId: string, branch: string }.");
      } else if (!switchIds.has(condition.switchId)) {
        err(`${path}.condition.switchId`, `référence un aiguillage inexistant : "${condition.switchId}" (règle §10.5).`);
      } else {
        const sw = switches.find((s) => isPlainObject(s) && s.id === condition.switchId) as
          | { branches?: unknown }
          | undefined;
        const branchKeys = Array.isArray(sw?.branches)
          ? (sw!.branches as unknown[])
              .filter(isPlainObject)
              .map((b) => b.key)
          : [];
        if (!branchKeys.includes(condition.branch)) {
          err(`${path}.condition.branch`, `"${condition.branch}" n'est pas une branche de l'aiguillage "${condition.switchId}" (règle §10.5).`);
        }
      }
    }

    if (edge.kind === "flux_financier" && isNonEmptyString(edge.target)) {
      const targetNode = nodes.find((n) => isPlainObject(n) && n.id === edge.target) as
        | { kind?: unknown }
        | undefined;
      if (targetNode && targetNode.kind !== "compte_public") {
        warn(
          `${path}`,
          `un flux_financier devrait cibler un compte_public pour entrer dans un solde (règle §10.4) ; cible ici "${targetNode.kind}".`,
        );
      }
    }
  });

  if (nodes.length > ABSOLUTE_NODE_CEILING) {
    err("$.nodes", `${nodes.length} nœuds dépassent le plafond absolu de ${ABSOLUTE_NODE_CEILING} (règle §7).`);
  } else if (nodes.length > COMFORTABLE_NODE_TARGET) {
    warn("$.nodes", `${nodes.length} nœuds dépassent la cible de lisibilité de ${COMFORTABLE_NODE_TARGET} pour une vue confortable (§7).`);
  }

  const valid = errors.length === 0;
  return { valid, errors, warnings, data: valid ? (raw as unknown as MechanismData) : null };
}
