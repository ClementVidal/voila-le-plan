-- Voilà le plan — schéma initial Supabase
--
-- À exécuter dans Supabase Dashboard → SQL Editor (aucun mot de passe de
-- base de données requis : l'app parle à Supabase via l'API REST/JS avec
-- la clé publique "anon", protégée par les policies RLS ci-dessous).
--
-- Une seule table, une colonne JSONB par graphe : on garde le principe
-- déjà en place (« un objet JSON pilote tout l'affichage »), sans jamais
-- avoir à écrire de migration SQL quand src/types.ts évolue.

create table if not exists public.graphs (
  slug text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

alter table public.graphs enable row level security;

-- Lecture : publique, pas de connexion requise (§1 du document de
-- passation : outil grand public, jamais derrière un login pour la carte).
create policy "graphs are publicly readable"
  on public.graphs for select
  using (true);

-- Écriture : réservée aux utilisateurs connectés (SSO Google configuré
-- dans Authentication → Providers). Pas de restriction de domaine email
-- pour l'instant ; facile à resserrer plus tard avec :
--   auth.jwt() ->> 'email' like '%@lafranceinsoumise.fr'
create policy "authenticated users can insert graphs"
  on public.graphs for insert
  to authenticated
  with check (true);

create policy "authenticated users can update graphs"
  on public.graphs for update
  to authenticated
  using (true)
  with check (true);

-- Renseigne updated_at / updated_by automatiquement à chaque écriture,
-- pour ne pas avoir à s'en souvenir côté client.
create or replace function public.set_graph_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$fn$;

create trigger graphs_set_metadata
  before insert or update on public.graphs
  for each row execute function public.set_graph_metadata();

-- Donnée initiale : reprend exactement public/data/smic-mecanisme.json
-- au moment de la migration (voir §11 du document de passation).
insert into public.graphs (slug, data)
values (
  'smic-mecanisme',
  $json$
{
  "nodes": [
    {
      "id": "mesure-smic",
      "kind": "mesure",
      "title": "SMIC à 1 600 € net",
      "summary": "Relèvement du salaire minimum interprofessionnel de croissance à 1 600 € nets par mois.",
      "position": { "x": 0, "y": 0 },
      "sources": [
        {
          "document": "programme",
          "edition": "AEC-2025",
          "url": "https://melenchon2027.fr/programme2025/livre/chapitre8",
          "locator": "chapitre 8",
          "note": "Mesure confirmée sur le site officiel du programme."
        }
      ],
      "status": "brouillon"
    },
    {
      "id": "switch-respect-hausse",
      "kind": "switch",
      "title": "L'entreprise applique la hausse du SMIC ?",
      "summary": "Aiguillage de modélisation représentant la conditionnalité des exonérations de cotisations au respect de la hausse de salaire (§5, motif 2).",
      "position": { "x": 0, "y": 0 },
      "sources": [
        {
          "document": "programme",
          "edition": "AEC-2025",
          "locator": "chapitre 8 (passage exact à confirmer)",
          "note": "⚠️ Passage exact du programme à sourcer précisément — voir §13 du document de passation."
        }
      ],
      "status": "interpretation",
      "branches": [
        { "key": "respect", "label": "Respecte la hausse" },
        { "key": "non_respect", "label": "Ne respecte pas la hausse" }
      ],
      "defaultBranch": "respect"
    },
    {
      "id": "var-masse-salariale",
      "kind": "variable",
      "title": "Masse salariale",
      "summary": "Somme des salaires bruts versés par les entreprises. Transmet l'effet de la hausse du SMIC sans être elle-même comptabilisée dans un solde public.",
      "position": { "x": 0, "y": 0 },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Variable de modélisation ; ne provient pas directement du texte du programme."
        }
      ],
      "status": "brouillon"
    },
    {
      "id": "var-cotisations",
      "kind": "variable",
      "title": "Cotisations sociales",
      "summary": "Prélèvements assis sur la masse salariale qui financent les régimes de sécurité sociale.",
      "position": { "x": 0, "y": 0 },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Variable de modélisation."
        }
      ],
      "status": "brouillon"
    },
    {
      "id": "var-salaire-net-smicards",
      "kind": "variable",
      "title": "Salaire net des smicards",
      "summary": "Revenu net individuel des salariés payés au SMIC. Distinct de la masse salariale agrégée (vue entreprise) : ici, l'effet est regardé du côté du ménage.",
      "position": { "x": 0, "y": 0 },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Variable de modélisation ; la mesure porte explicitement sur un montant net, ce qui rend le lien direct."
        }
      ],
      "status": "brouillon"
    },
    {
      "id": "var-prime-activite",
      "kind": "variable",
      "title": "Prime d'activité perçue",
      "summary": "Complément de revenu versé par l'État aux actifs modestes, dégressif avec le salaire (dispositif existant, hors programme). Une hausse du salaire net réduit mécaniquement la prime perçue.",
      "position": { "x": 0, "y": 0 },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Dispositif administratif existant (hors L'Avenir en commun), inclus pour distinguer le gain de pouvoir d'achat brut du gain net, conformément à l'argument « coût brut → coût net » du §6 du document de passation."
        }
      ],
      "status": "brouillon"
    },
    {
      "id": "var-pouvoir-achat",
      "kind": "variable",
      "title": "Pouvoir d'achat net des ménages au SMIC",
      "summary": "Effet net sur le revenu disponible des ménages dont un membre est payé au SMIC : gain de salaire net, minoré par la baisse de la prime d'activité perçue.",
      "position": { "x": 0, "y": 0 },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Variable de synthèse ; aucun montant n'est calculé, seul le sens des deux effets qui se combinent est représenté."
        }
      ],
      "status": "brouillon"
    },
    {
      "id": "mesure-perte-exoneration",
      "kind": "mesure",
      "title": "Perte des exonérations de cotisations",
      "summary": "Une entreprise qui ne respecte pas la hausse de salaire perd le bénéfice de ses exonérations de cotisations sociales : elle en paie davantage.",
      "position": { "x": 0, "y": 0 },
      "sources": [
        {
          "document": "programme",
          "edition": "AEC-2025",
          "locator": "chapitre 8 (passage exact à confirmer)",
          "note": "⚠️ Passage exact du programme à sourcer précisément — voir §13 du document de passation."
        }
      ],
      "status": "brouillon"
    },
    {
      "id": "mesure-pensions",
      "kind": "mesure",
      "title": "Pensions de carrière complète ≥ SMIC revalorisé",
      "summary": "Les pensions de retraite à carrière complète sont portées au minimum au niveau du SMIC revalorisé.",
      "position": { "x": 0, "y": 0 },
      "sources": [
        {
          "document": "programme",
          "edition": "AEC-2025",
          "url": "https://melenchon2027.fr/programme2025/livre/chapitre8",
          "locator": "chapitre 8"
        }
      ],
      "status": "brouillon"
    },
    {
      "id": "compte-secu",
      "kind": "compte_public",
      "title": "Sécurité sociale",
      "summary": "Compte public regroupant les caisses de sécurité sociale (maladie, retraite, famille…). Seuls les flux qui entrent dans ce compte sont comptabilisés dans son solde, pour éviter tout double comptage (§6).",
      "position": { "x": 0, "y": 0 },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Regroupement des régimes de sécurité sociale pour la modélisation du solde."
        }
      ],
      "status": "brouillon"
    }
  ],
  "edges": [
    {
      "id": "e-smic-vers-switch",
      "kind": "dependance",
      "source": "mesure-smic",
      "target": "switch-respect-hausse",
      "nature": "comptable",
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Entrée structurelle vers l'aiguillage de conditionnalité."
        }
      ],
      "status": "interpretation"
    },
    {
      "id": "e-switch-vers-masse-salariale",
      "kind": "conditionnel",
      "source": "switch-respect-hausse",
      "target": "var-masse-salariale",
      "sign": "+",
      "nature": "comptable",
      "condition": { "switchId": "switch-respect-hausse", "branch": "respect" },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Lien non écrit explicitement dans le texte, formulé par l'équipe de modélisation (§5, motif 2)."
        }
      ],
      "status": "interpretation"
    },
    {
      "id": "e-switch-vers-perte-exoneration",
      "kind": "conditionnel",
      "source": "switch-respect-hausse",
      "target": "mesure-perte-exoneration",
      "sign": "+",
      "nature": "comptable",
      "condition": { "switchId": "switch-respect-hausse", "branch": "non_respect" },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Lien non écrit explicitement dans le texte, formulé par l'équipe de modélisation (§5, motif 2)."
        }
      ],
      "status": "interpretation"
    },
    {
      "id": "e-switch-vers-salaire-net",
      "kind": "conditionnel",
      "source": "switch-respect-hausse",
      "target": "var-salaire-net-smicards",
      "sign": "+",
      "nature": "comptable",
      "condition": { "switchId": "switch-respect-hausse", "branch": "respect" },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "La mesure fixe directement un montant net : quand l'entreprise applique la hausse, le revenu net individuel augmente d'autant (§5, motif 2 — même aiguillage que la masse salariale)."
        }
      ],
      "status": "interpretation"
    },
    {
      "id": "e-salaire-net-vers-pouvoir-achat",
      "kind": "causal",
      "source": "var-salaire-net-smicards",
      "target": "var-pouvoir-achat",
      "sign": "+",
      "nature": "comptable",
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Effet direct et positif du salaire net sur le pouvoir d'achat, à isoler de l'effet compensateur de la prime d'activité (voir e-prime-activite-vers-pouvoir-achat)."
        }
      ],
      "status": "interpretation"
    },
    {
      "id": "e-salaire-net-vers-prime-activite",
      "kind": "causal",
      "source": "var-salaire-net-smicards",
      "target": "var-prime-activite",
      "sign": "-",
      "nature": "comptable",
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Barème dégressif de la prime d'activité : plus le salaire net augmente, moins la prime perçue est élevée. Mécanisme administratif existant, pas une mesure du programme."
        }
      ],
      "status": "interpretation"
    },
    {
      "id": "e-prime-activite-vers-pouvoir-achat",
      "kind": "causal",
      "source": "var-prime-activite",
      "target": "var-pouvoir-achat",
      "sign": "+",
      "nature": "comptable",
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "La prime d'activité fait partie du revenu disponible du ménage : sa baisse minore le gain de pouvoir d'achat apporté par la hausse du SMIC (argument « coût brut → coût net », §6)."
        }
      ],
      "status": "interpretation"
    },
    {
      "id": "e-masse-salariale-vers-cotisations",
      "kind": "causal",
      "source": "var-masse-salariale",
      "target": "var-cotisations",
      "sign": "+",
      "nature": "comptable",
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Identité comptable (les cotisations sont assises sur la masse salariale), non écrite telle quelle dans le texte."
        }
      ],
      "status": "interpretation"
    },
    {
      "id": "e-cotisations-vers-secu",
      "kind": "flux_financier",
      "source": "var-cotisations",
      "target": "compte-secu",
      "sign": "+",
      "nature": "comptable",
      "amount": {
        "unit": "Md€/an",
        "values": { "croisiere": null },
        "reference": "euros constants, régime de croisière — à préciser dès qu'un chiffrage aligné sur l'édition en cours sera disponible",
        "provisional": true
      },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Lien non écrit explicitement dans le texte, formulé par l'équipe de modélisation (§5, motif 1 : « Salaires → Sécu »)."
        }
      ],
      "status": "interpretation"
    },
    {
      "id": "e-perte-exoneration-vers-secu",
      "kind": "flux_financier",
      "source": "mesure-perte-exoneration",
      "target": "compte-secu",
      "sign": "+",
      "nature": "comptable",
      "amount": {
        "unit": "Md€/an",
        "values": { "croisiere": null },
        "reference": "euros constants, régime de croisière — à préciser dès qu'un chiffrage aligné sur l'édition en cours sera disponible",
        "provisional": true
      },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Convergence des deux branches de l'aiguillage vers les recettes de la Sécu (§5, motif 2)."
        }
      ],
      "status": "interpretation"
    },
    {
      "id": "e-smic-vers-pensions",
      "kind": "causal",
      "source": "mesure-smic",
      "target": "mesure-pensions",
      "sign": "+",
      "nature": "comptable",
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Cascade d'indexation : la hausse du SMIC revalorise le plancher des pensions (§5, motif 3)."
        }
      ],
      "status": "interpretation"
    },
    {
      "id": "e-pensions-vers-secu",
      "kind": "flux_financier",
      "source": "mesure-pensions",
      "target": "compte-secu",
      "sign": "-",
      "nature": "comptable",
      "amount": {
        "unit": "Md€/an",
        "values": { "croisiere": null },
        "reference": "euros constants, régime de croisière — à préciser dès qu'un chiffrage aligné sur l'édition en cours sera disponible",
        "provisional": true
      },
      "sources": [
        {
          "document": "autre",
          "edition": "modele-interne",
          "note": "Dépense induite : le nœud SMIC doit montrer recettes ET dépenses induites (§11, critères de réussite)."
        }
      ],
      "status": "interpretation"
    }
  ]
}
$json$::jsonb
)
on conflict (slug) do nothing;
