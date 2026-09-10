# Voilà le plan

Carte interactive du programme *L'Avenir en commun*, construite avec [React Flow](https://reactflow.dev/) (`@xyflow/react`) et [ELK.js](https://github.com/kieler/elkjs).

La spécification complète (vision, modèle de données, motifs d'interaction, feuille de route) est dans **[docs/passation.md](docs/passation.md)**.

## État actuel : prototype « mécanisme SMIC »

Première itération de la vue mécanisme (phases 0 et 1 de la feuille de route) : la boucle **augmentation des salaires → cotisations → recettes de la Sécurité sociale**, avec l'aiguillage conditionnel « l'entreprise respecte-t-elle la hausse du SMIC ? » qui montre la convergence des deux branches vers les recettes de la Sécu, et le nœud pensions qui montre la dépense induite en plus des recettes.

- Données : `src/data/smicMecanisme.ts` (schéma dans `src/types.ts`) — aucun montant n'est inventé, tout est `null` / `provisional: true`.
- Layout : `src/mechanism/` (ELK, gauche → droite).
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
