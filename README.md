# Voilà le plan

Carte interactive du programme *L'Avenir en commun*, construite avec [React Flow](https://reactflow.dev/) (`@xyflow/react`) et [ELK.js](https://github.com/kieler/elkjs).

La spécification complète (vision, modèle de données, motifs d'interaction, feuille de route) est dans **[docs/passation.md](docs/passation.md)**.

## État actuel : prototype « mécanisme SMIC »

Première itération de la vue mécanisme (phases 0 et 1 de la feuille de route) : la boucle **augmentation des salaires → cotisations → recettes de la Sécurité sociale**, avec l'aiguillage conditionnel « l'entreprise respecte-t-elle la hausse du SMIC ? » qui montre la convergence des deux branches vers les recettes de la Sécu, le nœud pensions qui montre la dépense induite en plus des recettes, et une branche **pouvoir d'achat des ménages** (gain de salaire net minoré par la baisse de la prime d'activité) qui applique côté ménage l'argument « coût brut → coût net » du §6.

- Données : **`public/data/smic-mecanisme.json`** (schéma dans `src/types.ts`), chargé au runtime — aucun montant n'est inventé, tout est `null` / `provisional: true`. L'app est pilotée par ce seul objet JSON : changer ce fichier change l'affichage, sans toucher au code. Le JSON n'a que deux clés, `nodes` et `edges` — les aiguillages conditionnels sont des nœuds comme les autres (`kind: "switch"`, avec `branches` / `defaultBranch`), pas une troisième liste à part.
- Édition : bouton **« Éditer les données »** en haut du canevas — bascule en mode édition (`src/edit/`) avec barre d'outils (ajouter un nœud de n'importe quel type), nœuds déplaçables, création d'arêtes à la souris (glisser d'un nœud à un autre), inspecteur latéral pour éditer tout le contenu d'un nœud ou d'une arête sélectionné(e), suppression en cascade, et validation en direct contre le schéma (`src/data/validateMechanismData.ts`). Brouillon local (`localStorage`, prévisualisable en quittant le mode édition) et export du JSON validé à committer. Aucune écriture directe sur GitHub depuis l'app (pas de backend) : publier un brouillon = le télécharger, remplacer `public/data/smic-mecanisme.json`, pousser sur `main`.
- Layout : `src/mechanism/` (ELK, gauche → droite, uniquement en mode lecture — le mode édition utilise les positions manuelles).
- Rendu : `src/components/` (nœuds, arêtes, panneau latéral de sources).

## Développement

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Déployé sur Vercel.
