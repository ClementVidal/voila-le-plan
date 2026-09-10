# Carte interactive de *L'Avenir en commun* (titre de travail)

> Document de passation destiné à Claude Code. Il résume toute la phase de conception (discussion du 10 septembre 2026).
> Aucune ligne de code n'a encore été écrite. Ce README est la spécification de départ.
> Les points marqués **⚠️ À VÉRIFIER** ne doivent pas être considérés comme acquis.

---

## Sommaire

1. [Vision et positionnement](#1-vision-et-positionnement)
2. [La source : le programme](#2-la-source--le-programme)
3. [Principes de conception](#3-principes-de-conception)
4. [Modèle conceptuel : nœuds et liens](#4-modèle-conceptuel--nœuds-et-liens)
5. [Les motifs d'interaction entre mesures](#5-les-motifs-dinteraction-entre-mesures)
6. [Le calque chiffrage](#6-le-calque-chiffrage)
7. [Lisibilité : le plafond de nœuds](#7-lisibilité--le-plafond-de-nœuds)
8. [Vues et navigation](#8-vues-et-navigation)
9. [Stack technique](#9-stack-technique)
10. [Données : schéma, sources, validation](#10-données--schéma-sources-validation)
11. [Prototype de référence : le mécanisme SMIC](#11-prototype-de-référence--le-mécanisme-smic)
12. [Feuille de route](#12-feuille-de-route)
13. [Questions ouvertes et points à vérifier](#13-questions-ouvertes-et-points-à-vérifier)
14. [Consignes pour Claude Code](#14-consignes-pour-claude-code)

---

## 1. Vision et positionnement

### Objectif

Présenter le programme de la France insoumise, *L'Avenir en commun*, sous forme d'une **application web extrêmement graphique** : une carte 2D que l'utilisateur explore en scrollant / zoomant / déplaçant la vue.

Chaque nœud représente :
- une idée ou un concept,
- une mesure,
- un poste de dépense ou de recette.

### Ce qui fait la valeur de l'outil

Pas la hiérarchie du programme (un sommaire suffit pour ça), mais **les interrelations entre les mesures** : montrer visuellement comment une mesure en entraîne une autre, comment elles se financent, se conditionnent ou se protègent mutuellement.

Exemples fondateurs donnés par le porteur du projet :
- **La hausse des salaires entraîne une hausse des recettes des régimes de sécurité sociale** (via les cotisations).
- **Si une entreprise ne respecte pas la hausse de salaire, elle perd le bénéfice des exonérations de cotisations** dont elle pourrait bénéficier (conditionnalité).

### Positionnement

- Outil **de présentation du programme**, conçu pour être **transmis à LFI**.
- But : donner aux gens une vision claire du programme et des liens entre les mesures.
- Conséquences :
  - l'équipe programme de LFI doit pouvoir **valider la logique** des liens ;
  - les données doivent être **éditables sans le développeur** (le programme évolue) ;
  - chaque élément doit être **sourcé** : les flèches et les chiffres sont précisément ce que les contradicteurs attaqueront.

### Public

Grand public, souvent sur **mobile** (outil partagé sur les réseaux). Ne doit **jamais effrayer** par une surcharge d'information.

---

## 2. La source : le programme

### Référence

- *L'Avenir en commun*, **édition 2025** : https://melenchon2027.fr/programme2025/livre/
- Environ **831 mesures** (chiffre issu de sources tierces, ⚠️ À VÉRIFIER sur le texte officiel).
- Au 10/09/2026, la page officielle indique que le programme est **en cours de réactualisation** et qu'une nouvelle version sera publiée prochainement. Une source tierce évoque une publication à l'automne 2026 (⚠️ À VÉRIFIER).
- **Conséquence architecturale majeure : le contenu doit être versionné et ré-importable.** Ne pas coder en dur quoi que ce soit du programme.

### Structure (édition 2025)

Introduction + 4 parties + 18 chapitres. Chaque chapitre est découpé en **sections** (format d'URL observé : `/programme2025/livre/chapitreN/sM/`).

| Partie | Chapitres |
|---|---|
| **Introduction** : Vers une nouvelle France | — |
| **Faire la révolution citoyenne** | 1. Le pouvoir au peuple · 2. Par delà la propriété privée · 3. Citoyens dans l'entreprise et dans la ville · 4. Étendre le domaine de la liberté |
| **L'harmonie des êtres humains entre eux** | 5. Élever le niveau d'instruction · 6. Partage des richesses · 7. La force de l'entraide · 8. Travailler tous, travailler moins, travailler mieux · 9. Produire nous-mêmes pour répondre aux besoins · 10. Faire place à la nouvelle France · 11. Humaniser par la culture et le sport |
| **L'harmonie des êtres humains avec la nature** | 12. Planification écologique · 13. Les grands chantiers de la bifurcation écologique · 14. Protection des biens communs et des droits de l'espèce · 15. Une approche de santé globale |
| **Ordonner le monde** | 16. Une diplomatie altermondialiste pour la paix · 17. Europe · 18. Nouvelles frontières de l'humanité |

URLs des chapitres : `https://melenchon2027.fr/programme2025/livre/chapitre1` … `chapitre18`.

Exemple de sections (chapitre 6, Partage des richesses) : mettre au pas la finance ; banques au service de l'intérêt général ; définanciariser l'économie réelle ; annuler la dette publique ; révolution fiscale.

> Note : lors de la conception, les pages de chapitres / sections n'ont pas pu être lues automatiquement (erreurs 404 / redirections côté outil de récupération). Le scraping devra être testé et, si besoin, remplacé par un import manuel ou un export fourni par LFI.

### Le chiffrage

- Le **livre ne contient pas les montants**.
- Le **chiffrage officiel public connu date de 2022** (programme présidentiel 2022), réalisé avec une quarantaine d'économistes, hauts fonctionnaires et statisticiens.
- Il n'est donc pas aligné sur l'édition 2025 et sera probablement révisé avec la nouvelle version.
- **Stratégie retenue** :
  1. demander directement à LFI les **tableaux de chiffrage** (idéalement en tableur) ;
  2. en attendant, prototyper avec les chiffres 2022, **clairement marqués comme provisoires** dans l'interface.

### Outils voisins existants (pour se positionner, pas pour copier)

- **cachangequoi.fr** : simulateur citoyen de l'impact du programme sur le budget personnel.
- **francebudget.fr** : simulation macroéconomique (dette, déficit, chômage) du programme.

Notre angle est différent : **les mécanismes et les liens entre mesures**.

---

## 3. Principes de conception

1. **Les liens avant les nœuds.** Un arbre parties → chapitres → mesures n'est qu'une mind map. Ce qui justifie un graphe, ce sont les liens transversaux et causaux.
2. **Une carte, pas un graphe à forces.** Disposition fixe et « géographique » : les parties sont des continents, les chapitres des régions, les sections des départements, les mesures des villes. Stable d'une visite à l'autre, mémorisable.
3. **Zoom sémantique.** Le niveau de détail dépend du zoom (comme Google Maps).
4. **Focus + contexte.** Un seul groupe déplié à la fois ; le reste est replié.
5. **Sobriété visuelle.** Peu de nœuds, un titre et au plus un chiffre par nœud, le détail dans un panneau.
6. **Traçabilité totale.** Tout nœud, tout lien, tout montant renvoie à sa source.
7. **Honnêteté du modèle.** Distinguer ce qui est comptable de ce qui repose sur des hypothèses ; montrer les dépenses induites autant que les recettes induites.
8. **Contenu séparé du rendu.** Données dans des fichiers structurés et versionnés ; l'app ne fait que les afficher.

---

## 4. Modèle conceptuel : nœuds et liens

### Types de nœuds

| Type | Rôle | Exemples |
|---|---|---|
| `partie` / `chapitre` / `section` | Structure de la carte (nœuds-groupes repliables) | « Partage des richesses » |
| `mesure` | Ce que le programme **décide** | SMIC à 1 600 € net |
| `variable` | Ce qui **change en conséquence** (transmet les effets, ne compte rien elle-même) | masse salariale, consommation, emploi |
| `compte_public` | Réservoirs où convergent les flux financiers, avec un solde visible | État, Sécurité sociale, collectivités |
| `acteur` | Qui agit ou subit | entreprises, salariés, ménages, caisses |
| `principe` | Concept transversal très connecté (hub) | planification écologique, révolution citoyenne |

### Types de liens

| Type | Sens | Rendu suggéré |
|---|---|---|
| `appartenance` | mesure → section → chapitre → partie | implicite (imbrication), pas de flèche |
| `contribution` | une mesure sert un principe | trait fin |
| `dependance` | une mesure en suppose une autre | trait avec marqueur |
| `causal` | une variation se propage (signe `+` ou `−`) | flèche signée |
| `flux_financier` | montant en Md€/an | flèche dont l'épaisseur est proportionnelle au montant |
| `conditionnel` | branche d'un aiguillage (si respect / si non-respect) | branche activable par interrupteur |
| `verrou` | une mesure protège l'effet d'une autre | style distinct (cadenas) |
| `flux_non_monetaire` | autre unité (logements, emplois…) | style distinct + unité affichée |

### Attributs obligatoires d'un lien

- **signe** : `+` / `−` (pour les liens causaux) ;
- **montant** et **unité** (si chiffré) ;
- **source** : passage du programme ou du document de chiffrage ;
- **nature** :
  - `comptable` : découle d'un calcul (plus de salaire brut ⇒ plus de cotisations) → **trait plein** ;
  - `hypothese` : repose sur des hypothèses économiques débattues (effets emploi, multiplicateur, consommation) → **trait pointillé** ;
- **statut de validation** : `brouillon` / `interpretation` (lien non écrit explicitement dans le programme, formulé par l'équipe) / `valide_lfi`.

---

## 5. Les motifs d'interaction entre mesures

Identifiés pendant la conception. **Chaque motif doit devenir un composant visuel réutilisable.**

> ⚠️ Les mesures citées ci-dessous proviennent, sauf la mesure SMIC (confirmée sur le site officiel), d'un relevé d'extraits tiers de l'édition 2025. **Chaque mesure doit être vérifiée sur le texte officiel avant modélisation.**

### Motif 1 : l'effet retour

Une dépense génère des recettes induites ; une partie du coût revient.

- **Salaires → Sécu** (exemple fondateur) : hausse des salaires → masse salariale ↑ → cotisations ↑ → recettes Sécu ↑.
- **Point d'indice des fonctionnaires +10 %** (ch. 9) : l'État paie, mais une partie revient en cotisations **vers un autre compte** (la Sécu). Justifie de garder les comptes publics séparés.
- **Rénovation d'au moins 700 000 logements par an**, aides ciblées selon les revenus (ch. 13) : activité → cotisations (pointillé) ; et baisse des factures énergétiques des ménages.

### Motif 2 : l'aiguillage conditionnel

Une règle « si / sinon ». Représentée par un **interrupteur** que l'utilisateur bascule ; les flux de la branche inactive se coupent.

- **Hausse des salaires / exonérations** (exemple fondateur, ⚠️ passage exact à sourcer dans le texte) : l'entreprise augmente les salaires → la masse salariale et les cotisations augmentent ; elle ne les augmente pas → elle perd ses exonérations. **Les deux branches convergent vers les recettes de la Sécu** : c'est le moment visuel fort.
- **Égalité salariale femmes-hommes** (ch. 8) : non-respect sanctionné financièrement et pénalement. Même structure : respect → masse salariale ↑ ; non-respect → sanction.
- **Annulation des cadeaux fiscaux accordés sans contrepartie aux plus grandes entreprises** (ch. 13) : même logique de contrepartie, dans un autre chapitre → exemple type de lien transversal.

### Motif 3 : la cascade d'indexation

Une mesure en fait bouger d'autres automatiquement ; **un même nœud produit à la fois des recettes et des dépenses**.

- **SMIC à 1 600 € net** (ch. 8) + **pensions de carrière complète portées au minimum au niveau du SMIC revalorisé** (ch. 8) : la hausse du SMIC augmente les cotisations **et** les dépenses de retraite.
- **Minimum vieillesse au niveau du seuil de pauvreté** (ch. 8).
- Exigence : le nœud SMIC affiche **les deux côtés**, sinon l'outil sera accusé de ne montrer que les recettes.

### Motif 4 : le verrou

Une mesure protège l'effet d'une autre.

- **APL +10 %** (ch. 9) + **encadrement des loyers** (ch. 7) : sans encadrement, une partie de la hausse des aides peut être absorbée par les loyers.
- **Hausse du SMIC** + **indexation des salaires sur l'inflation** (ch. 8) + **encadrement des prix des produits alimentaires de première nécessité** (ch. 7) : protection du pouvoir d'achat.
- ⚠️ Ces liens sont une **interprétation** : statut `interpretation`, à faire valider par LFI.

### Motif 5 : la recette qui s'érode

Une taxe dont le succès réduit le rendement ; l'effet se déplace ailleurs.

- **Taxe kilométrique aux frontières** (ch. 9) pour dissuader délocalisations et importations lointaines : si elle fonctionne, elle rapporte de moins en moins, et l'effet passe par les relocalisations.
- Rendu : deux jauges couplées (l'une se vide pendant que l'autre se remplit). Important pour l'honnêteté du chiffrage.

### Motif 6 : les flux non monétaires

Certaines chaînes transportent autre chose que des euros.

- **Plafond de cinq logements transmissibles par héritage, réquisition au-delà** (ch. 7) → offre de logement → objectif **zéro sans-abri** (ch. 7).
- Le modèle doit accepter d'autres unités (logements, emplois, tonnes de CO₂…).

### Autres pistes repérées (non détaillées)

- Première tranche gratuite d'électricité, chaleur, eau, gaz (ch. 7) / tarification progressive de l'eau selon les usages (ch. 14) : boucle de financement interne possible (⚠️ interprétation).
- Héritage maximal de 12 M€ (ch. 6).
- Plan de 200 Md€ d'investissements écologiquement et socialement utiles (ch. 13).

---

## 6. Le calque chiffrage

### Principe

Les idées n'ont pas de « taille » naturelle ; les dépenses si. Les mélanger sur la même échelle serait trompeur. D'où **deux calques** :

- **Carte des idées** : taille des nœuds = nombre de connexions (ou taille fixe).
- **Calque chiffrage** (superposable) : épaisseurs et tailles proportionnelles aux montants ; les liens financiers deviennent des **flux**.

### L'argument central : du coût brut au coût net

Chaque mesure affiche son **coût brut** ; en suivant les flèches de retour (cotisations, TVA, impôts) on arrive au **coût net**. C'est ce qu'un tableau de chiffrage montre mal et qu'un graphe rend évident.

### Décision v1 : régime de croisière

- **Un seul montant par flèche**, en régime de croisière.
- Convention affichée partout : **« Md€ par an, régime de croisière, euros constants de l'année X »**.
- S'aligner **strictement** sur l'horizon et l'année de référence du chiffrage source. **Ne jamais mélanger des montants de sources différentes.**

### Conventions pour les mesures qui n'ont pas de « croisière »

| Cas | Traitement |
|---|---|
| Investissements ponctuels (grands chantiers, rénovation, infrastructures) | Annualisés sur leur durée, **ou** placés dans une zone « exceptionnel » hors du solde annuel (choix à documenter) |
| Opérations patrimoniales (nationalisations, rachats) | Capital, pas un flux annuel : seuls les **effets récurrents** entrent (dividendes, intérêts) |
| Coûts de transition | Disparaissent en croisière : **signalés par une note**, jamais omis en silence |

### Pièges de modélisation

- **Double comptage** : un euro traversant plusieurs nœuds ne compte qu'une fois. Règle : **seuls les flux entrant dans les `compte_public` sont comptabilisés** ; les variables intermédiaires transmettent sans compter.
- **Le temps** : prévoir dès maintenant qu'un montant soit **une valeur par année** (dictionnaire année → valeur), même si la v1 ne remplit que la croisière. Passer aux trajectoires sur le quinquennat sera alors un ajout de données, pas une refonte.

### Montants fixes vs simulateur

- **v1 : montants fixes** repris du chiffrage.
- **Plus tard, éventuellement : coefficients** sur les flèches (« +1 % de masse salariale → +X Md€ de cotisations ») avec curseurs. Spectaculaire, mais cela fait de nous les auteurs d'un modèle économique que LFI devrait valider. **Hors périmètre v1.**

---

## 7. Lisibilité : le plafond de nœuds

### Contrainte

**Jamais plus de 50 nœuds à l'écran, et en pratique beaucoup moins.** Les utilisateurs ne doivent pas être effrayés par la quantité de données.

### Cibles

| Contexte | Nombre de nœuds |
|---|---|
| Écran d'accueil | 4 à 5 (les parties) |
| Vue confortable | 10 à 15 |
| Mobile | moins que desktop |
| Plafond absolu | 50 |

### Hiérarchie calibrée sur le plafond

831 mesures / 18 chapitres ≈ 46 mesures par chapitre : déjà la limite avant d'ajouter variables et comptes. D'où le niveau **section** :

```
4 parties
└─ 18 chapitres
   └─ sections (~5 par chapitre)
      └─ mesures (~8 à 10 par section)
```

### Focus + contexte

- Seul l'élément en focus est déplié ; tout le reste est replié en **nœuds-groupes**.
- En entrant dans une section, les sections voisines restent des bulles fermées.

### Portails

- Les liens transversaux pointent souvent hors écran (ex. section salaires → Sécu, dans un autre chapitre).
- On n'ajoute **pas** le nœud distant : on affiche un **portail** au bord de l'écran, dans la bonne direction, étiqueté (« → Recettes Sécu (ch. 7) »). Clic = déplacement animé de la caméra.
- Les flèches transversales ne s'affichent **que pour le nœud sélectionné**.

### Contenu d'un nœud

- Un titre + au plus un chiffre.
- Le détail (texte, source, calcul, statut) va dans un **panneau latéral** (desktop) ou un **volet en bas de l'écran** (mobile).

### Vue mécanisme

- Si une chaîne causale dépasse ~15 nœuds, replier les variables intermédiaires en un nœud dépliable.

### Règle de validation des données

Le plafond est **une règle de validation**, pas une discipline : si un groupe dépasse le seuil, l'éditeur / le validateur **refuse** et oblige à découper.

---

## 8. Vues et navigation

### Vue carte (exploration)

- Disposition fixe géographique, positions **stockées dans les données**.
- Zoom sémantique : parties → chapitres → sections → mesures → texte.
- Pan / zoom au scroll (desktop), pinch (mobile).
- Minimap **maison** simplifiée (continents uniquement).
- Recherche.

### Vue mécanisme (explication)

- On active une mesure : les nœuds de sa chaîne causale sont **extraits** et réalignés en schéma **de gauche à droite**, avec **transition animée** depuis la carte.
- **Propagation animée** : une impulsion parcourt les flèches, chaque variable touchée s'allume en `+` ou `−`, les montants circulent.
- Interrupteurs pour les aiguillages conditionnels.

### Calque chiffrage

- Superposable sur les deux vues.
- Solde visible par compte public ; coût brut → coût net.
- Mention « provisoire » tant que le chiffrage n'est pas celui de l'édition en cours.

### Parcours guidés

Animations de caméra de nœud en nœud, par exemple :
- « Suivre l'argent »
- « Ce qui change pour un salarié »
- « De la constituante aux lois »

---

## 9. Stack technique

Le porteur du projet est développeur full stack **React / TypeScript**.

### Rendu : React Flow (`@xyflow/react`, v12)

Retenu parce que :
- les **nœuds sont des composants React** (cartes riches, interrupteurs d'aiguillage, montants) ;
- pan, zoom, flèches personnalisées en SVG (flux animés) fournis ;
- **la même lib sert à construire l'éditeur** où l'équipe LFI place les nœuds et tire les liens → données éditables sans le développeur ;
- avec **≤ 50 nœuds à l'écran**, les limites de performance du DOM ne sont pas un sujet : **pas de virtualisation ni de WebGL nécessaires**. On peut soigner animations et effets graphiques.

Bonnes pratiques à respecter malgré tout :
- mémoïser les composants de nœuds et de liens personnalisés (`React.memo`) ou les déclarer hors du composant parent ;
- ne pas utiliser la minimap native pour tout le graphe (bug connu au-delà de ~700 nœuds) → minimap maison.

### D3 : boîte à outils, pas moteur de rendu

- `d3-scale` : épaisseur des flèches proportionnelle aux Md€, tailles de nœuds ;
- `d3-interpolate` / `d3-ease` : animations de propagation ;
- éventuellement `d3-sankey` pour une vue de synthèse du calque chiffrage.

Ne **pas** utiliser D3 comme moteur principal : il faudrait réécrire pan/zoom, détection des clics et édition.

### Layout

- **Carte** : **aucun calcul au chargement**. Positions persistées dans les données, placées dans l'éditeur (éventuellement pré-calculées hors ligne puis ajustées à la main).
- **Vue mécanisme** : **ELK.js** (`elkjs`), algorithme hiérarchique (`layered`), direction gauche → droite.

### Hors périmètre (plan B abandonné)

WebGL (Sigma.js, PixiJS) n'aurait été utile que pour une vue « galaxie » affichant tout le programme simultanément. Incompatible avec le principe de lisibilité : **non retenu**.

### Cible

Mobile first dans les tests : valider sur un téléphone milieu de gamme.

---

## 10. Données : schéma, sources, validation

### Principes

- Contenu dans des fichiers structurés (JSON ou équivalent), **versionnés** (par édition du programme).
- **Schéma générique** : ne rien supposer de propre à LFI dans le moteur → possibilité de charger d'autres programmes plus tard.
- Pipeline de **ré-import** pour la prochaine édition.

### Schéma retenu (voir `src/types.ts`)

```ts
type Id = string;

type SourceRef = {
  document: 'programme' | 'chiffrage' | 'autre';
  edition: string;          // ex. "AEC-2025", "chiffrage-2022"
  url?: string;             // ex. https://melenchon2027.fr/programme2025/livre/chapitre8
  locator?: string;         // chapitre / section / page
  note?: string;
};

type ValidationStatus = 'brouillon' | 'interpretation' | 'valide_lfi';

type NodeKind =
  | 'partie' | 'chapitre' | 'section'
  | 'mesure' | 'variable' | 'compte_public' | 'acteur' | 'principe';

type GraphNode = {
  id: Id;
  kind: NodeKind;
  title: string;            // court : affiché sur le nœud
  summary?: string;         // affiché dans le panneau
  parentId?: Id;            // appartenance (section, chapitre…)
  position: { x: number; y: number };  // layout carte, persisté
  sources: SourceRef[];
  status: ValidationStatus;
};

type Amount = {
  unit: 'Md€/an' | 'logements' | 'emplois' | string;
  // Une valeur par année ; la v1 ne remplit que "croisiere".
  values: Partial<Record<'croisiere' | `${number}`, number | null>>;
  reference: string;        // ex. "euros constants 20XX, régime de croisière"
  provisional: boolean;     // true tant que le chiffrage n'est pas celui de l'édition courante
};

type EdgeKind =
  | 'contribution' | 'dependance' | 'causal' | 'flux_financier'
  | 'conditionnel' | 'verrou' | 'flux_non_monetaire';

type GraphEdge = {
  id: Id;
  kind: EdgeKind;
  source: Id;
  target: Id;
  sign?: '+' | '-';
  nature: 'comptable' | 'hypothese';   // trait plein / pointillé
  amount?: Amount;
  condition?: { switchId: Id; branch: 'respect' | 'non_respect' | string };
  sources: SourceRef[];
  status: ValidationStatus;
};

type Switch = {                 // aiguillage conditionnel
  id: Id;
  label: string;                // ex. "L'entreprise augmente les salaires ?"
  branches: { key: string; label: string }[];
  defaultBranch: string;
};
```

### Règles de validation (à implémenter comme tests / linter de données)

1. Tout nœud et tout lien a **au moins une source**.
2. Tout montant a une **unité**, une **référence** (année / convention) et un drapeau `provisional`.
3. **Plafond** : aucun groupe (partie, chapitre, section, chaîne de mécanisme) n'expose plus que le seuil configuré de nœuds enfants visibles simultanément.
4. **Pas de double comptage** : seuls les flux dont la cible est un `compte_public` entrent dans les soldes.
5. Tout lien `conditionnel` référence un `Switch` existant et une branche valide.
6. Les montants d'un même calcul de solde proviennent **de la même source de chiffrage**.
7. Tout lien au statut `interpretation` est **visuellement signalé** dans l'interface (au moins en mode relecture).

### Extraction des mesures

- Premier jet possible par LLM à partir des 18 chapitres, **relecture humaine obligatoire**.
- Chaque mesure extraite garde son `SourceRef` (chapitre, section).
- Les liens causaux ne sont souvent **pas écrits** dans le livre : ils sont formulés par l'équipe → statut `interpretation` jusqu'à validation LFI.

### Éditeur

- Construit avec React Flow.
- Permet de : placer les nœuds (positions carte), créer / typer les liens, renseigner sources et montants, changer les statuts.
- Applique les règles de validation en direct.
- Cible : utilisable par l'équipe programme de LFI sans développeur.

---

## 11. Prototype de référence : le mécanisme SMIC

Le nœud **SMIC** concentre à lui seul **quatre motifs** : effet retour, aiguillage conditionnel, cascade d'indexation, verrou. C'est le premier prototype à construire, et la démo à montrer à LFI pour valider la logique.

**Implémenté** dans `src/data/smicMecanisme.ts` (données) et `src/mechanism/` + `src/components/` (rendu). Voir le README racine pour la liste des simplifications de cette première itération (verrous non modélisés).

### Chaîne modélisée

```
[mesure] SMIC à 1 600 € net (ch. 8)
   │ +  (comptable)
   ▼
[switch] L'entreprise applique la hausse du SMIC ?
   ├─ respect      → [variable] Masse salariale → [variable] Cotisations sociales ─┐
   └─ non_respect  → [mesure] Perte des exonérations de cotisations ───────────────┤
                                                                                     ▼
                                                                    [compte_public] Sécurité sociale
[mesure] SMIC à 1 600 € net
   │ +  (cascade d'indexation)
   ▼
[mesure] Pensions carrière complète ≥ SMIC revalorisé (ch. 8)
   │ −  (flux_financier, dépense)
   ▼
[compte_public] Sécurité sociale (dépenses retraite)
```

Les verrous (indexation des salaires sur l'inflation, encadrement des prix alimentaires) ne sont pas encore modélisés dans cette première itération — à ajouter dans un prochain passage (le style visuel « cadenas » du §5 motif 4 reste à construire).

### Montants

**Aucun montant n'a été inventé.** Tous les `values` restent à `null` avec `provisional: true` tant qu'ils ne sont pas repris d'un document de chiffrage identifié.

### Critères de réussite du prototype

- Lisible sur mobile, ≤ 15 nœuds dans la vue mécanisme. ✅ (7 nœuds)
- Propagation animée compréhensible sans texte. ✅ (bouton « Lancer/Arrêter la propagation », flèches actives animées)
- L'interrupteur montre clairement la **convergence des deux branches** vers les recettes de la Sécu. ✅
- Le nœud SMIC montre **recettes induites et dépenses induites**. ✅ (branche cotisations vs branche pensions)
- Chaque flèche ouvre sa source dans le panneau. ✅ (clic sur une arête)

---

## 12. Feuille de route

| Phase | Contenu | Livrable | Statut |
|---|---|---|---|
| **0. Modèle** | Modéliser le mécanisme SMIC complet (nœuds, flèches, signes, natures, sources, montants à `null`) ; figer le schéma de données et les règles de validation | Fichier de données SMIC + validateur | ✅ données ; validateur automatisé à écrire |
| **1. Prototype mécanisme** | Vue mécanisme React Flow + ELK, propagation animée, interrupteur, panneau de détail, responsive | Démo à montrer à LFI | ✅ première itération (verrous à ajouter) |
| **2. Validation LFI** | Présenter la démo, valider la logique des liens, **demander les tableaux de chiffrage** et un point de contact | Retours + source de chiffrage | à faire |
| **3. Carte** | Structure parties / chapitres / sections, zoom sémantique, focus + contexte, portails, minimap maison, recherche | Carte navigable (sans toutes les mesures) | à faire |
| **4. Éditeur** | Édition des positions, liens, sources, montants, statuts ; validation en direct | Outil de saisie pour l'équipe | à faire |
| **5. Données** | Extraction des mesures (LLM + relecture), rattachement aux sections, liens transversaux | Jeu de données édition courante | à faire |
| **6. Calque chiffrage** | Régime de croisière, soldes par compte public, coût brut → net, mention provisoire | Calque activable | à faire |
| **7. Parcours guidés** | « Suivre l'argent », « Ce qui change pour un salarié », etc. | Parcours animés | à faire |
| **Plus tard** | Trajectoires année par année ; coefficients / curseurs (si validés par LFI) ; import d'autres programmes | — | — |

> Stratégie de timing : ne pas saisir massivement les mesures de l'édition 2025 tant que la nouvelle édition n'est pas publiée. Prototyper, construire l'éditeur et le pipeline d'import d'abord.

---

## 13. Questions ouvertes et points à vérifier

### À vérifier (⚠️)

- Nombre exact de mesures de l'édition 2025 (831 selon des sources tierces).
- Date de publication de la nouvelle édition (automne 2026 selon une source tierce).
- **Toutes les mesures citées au §5**, à confirmer sur le texte officiel (seule la mesure SMIC 1 600 € net + indexation des salaires a été confirmée sur le site officiel).
- Le passage exact du programme correspondant à la **conditionnalité des exonérations** au respect des hausses de salaire.
- Existence et contenu d'un **chiffrage officiel** aligné sur l'édition 2025 ou la future édition.
- Possibilité technique de scraper les pages du programme (échecs constatés lors de la conception).

### Décisions encore ouvertes

- Année de référence et convention monétaire exacte du calque chiffrage (dépend de la source).
- Traitement des investissements ponctuels : annualisation **ou** zone « exceptionnel ».
- Placement initial de la carte : entièrement manuel ou pré-calcul hors ligne puis ajustement.
- Charte graphique : propre au projet ou alignée sur l'identité visuelle de LFI (à discuter avec eux).
- Hébergement, nom définitif, licence du code et des données.
- Seuil exact du plafond de nœuds (50 absolu, cible 10–15) et variante mobile.

---

## 14. Consignes pour Claude Code

1. **Ne jamais inventer de chiffres.** Un montant sans source identifiée reste `null` et marqué provisoire.
2. **Ne jamais inventer de mesure.** Toute mesure doit pointer vers le texte officiel ; en cas de doute, statut `brouillon`.
3. **Les liens non écrits explicitement dans le programme** sont au statut `interpretation`.
4. **Séparer strictement données et rendu.** Aucun contenu du programme codé en dur dans les composants.
5. **Respecter le plafond de nœuds** : c'est une contrainte produit, pas une optimisation.
6. **Commencer par la phase 0 puis 1** (mécanisme SMIC), pas par la carte complète.
7. Stack : **React + TypeScript + `@xyflow/react` + `elkjs` + modules D3 ciblés**. Pas de WebGL.
8. Mémoïser les nœuds et liens personnalisés React Flow.
9. Tester le rendu **sur mobile** dès le prototype.
10. Garder à l'esprit la **passation à LFI** : code lisible, données documentées, éditeur utilisable par des non-développeurs.
