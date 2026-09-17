# Voilà le plan

Carte interactive du programme *L'Avenir en commun*, construite avec [React Flow](https://reactflow.dev/) (`@xyflow/react`) et [ELK.js](https://github.com/kieler/elkjs).

La spécification complète (vision, modèle de données, motifs d'interaction, feuille de route) est dans **[docs/passation.md](docs/passation.md)**.

## État actuel : prototype « mécanisme SMIC »

Première itération de la vue mécanisme (phases 0 et 1 de la feuille de route) : la boucle **augmentation des salaires → cotisations → recettes de la Sécurité sociale**, avec l'aiguillage conditionnel « l'entreprise respecte-t-elle la hausse du SMIC ? » qui montre la convergence des deux branches vers les recettes de la Sécu, le nœud pensions qui montre la dépense induite en plus des recettes, et une branche **pouvoir d'achat des ménages** (gain de salaire net minoré par la baisse de la prime d'activité) qui applique côté ménage l'argument « coût brut → coût net » du §6.

- Données : persistées dans **Supabase** (table `graphs`, colonne `data jsonb` — voir `supabase/migrations/0001_init.sql` et **[docs/supabase.md](docs/supabase.md)**) — aucun montant n'est inventé, tout est `null` / `provisional: true`. L'app est pilotée par ce seul objet JSON : changer la ligne en base change l'affichage, sans toucher au code. Deux clés seulement, `nodes` et `edges` — les aiguillages conditionnels sont des nœuds comme les autres (`kind: "switch"`, avec `branches` / `defaultBranch`), pas une troisième liste à part. `public/data/smic-mecanisme.json` reste dans le dépôt comme référence historique, mais n'est plus lu au runtime.
- Accès : **lecture publique** (la carte, pas de connexion requise) ; **édition réservée aux utilisateurs connectés via Google SSO** (Supabase Auth + policies RLS — voir docs/supabase.md).
- Édition : bouton **« Éditer les données »** en haut du canevas (visible une fois connecté) — bascule en mode édition (`src/edit/`) avec barre d'outils (ajouter un nœud de n'importe quel type), nœuds déplaçables, création d'arêtes à la souris (glisser d'un nœud à un autre), inspecteur latéral pour éditer tout le contenu d'un nœud ou d'une arête sélectionné(e), suppression en cascade, et validation en direct contre le schéma (`src/data/validateMechanismData.ts`). « Enregistrer » écrit directement dans Supabase (persistance réelle, plus de brouillon local à committer manuellement) ; « Télécharger le JSON » reste disponible comme export/sauvegarde.
- Layout : `src/mechanism/` (ELK, gauche → droite, uniquement en mode lecture — le mode édition utilise les positions manuelles, stockées en base).
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
