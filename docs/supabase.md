# Backend Supabase

L'app est un SPA statique (Vite) : Supabase lui fournit la persistance et
les « endpoints d'update » sans backend custom à écrire — le client parle
directement à l'API REST auto-générée de Supabase, protégée par des
policies RLS (Row Level Security).

- **Lecture** (la carte) : publique, aucune connexion requise.
- **Écriture** (bouton « Éditer » + sauvegarde) : réservée aux utilisateurs
  connectés via Google SSO.

## 1. Schéma et policies

Aucune connexion `psql` ni mot de passe de base nécessaire : tout se fait
dans **Supabase Dashboard → SQL Editor**.

1. Ouvre `supabase/migrations/0001_init.sql`.
2. Colle son contenu dans le SQL Editor et exécute-le.

Ça crée :
- une table `graphs` (une ligne = un graphe, colonne `data jsonb` — le
  même objet `{ nodes, edges }` que `public/data/smic-mecanisme.json`) ;
- une policy de lecture publique ;
- des policies d'écriture réservées au rôle `authenticated` ;
- un trigger qui renseigne `updated_at` / `updated_by` automatiquement ;
- la donnée initiale du mécanisme SMIC (reprise du fichier JSON existant).

## 2. Activer Google SSO

Dans **Supabase Dashboard → Authentication → Providers → Google** :

1. Crée un OAuth Client ID sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (type "Web application").
2. Renseigne comme *Authorized redirect URI* celui que Supabase affiche
   sur cette page (`https://<ton-projet>.supabase.co/auth/v1/callback`).
3. Colle le Client ID et le Client Secret dans Supabase, active le
   provider.
4. Dans **Authentication → URL Configuration**, ajoute l'URL de l'app
   déployée (`https://voila-le-plan.vercel.app`) et `http://localhost:5173`
   (dev local) aux *Redirect URLs*.

Aucune restriction de domaine email n'est appliquée pour l'instant :
n'importe quel compte Google peut éditer une fois connecté. Pour limiter
à l'équipe LFI, resserrer les policies `insert`/`update` de
`0001_init.sql` avec `auth.jwt() ->> 'email' like '%@lafranceinsoumise.fr'`.

## 3. Variables d'environnement

Récupère dans **Supabase Dashboard → Project Settings → API** :
- `Project URL` → `VITE_SUPABASE_URL`
- `anon public` key → `VITE_SUPABASE_ANON_KEY`

Ces deux valeurs sont **publiques par construction** (elles finissent dans
le bundle JS envoyé au navigateur) : la sécurité vient des policies RLS,
pas du secret de la clé anon. Le mot de passe de la base de données, lui,
n'est jamais utilisé par l'app et ne doit être partagé nulle part.

En local (`.env.local`, ignoré par git) :

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Sur Vercel : **Project Settings → Environment Variables**, ajouter les
deux mêmes clés (Production + Preview), puis redéployer.

## 4. Après configuration

- `public/data/smic-mecanisme.json` reste dans le dépôt comme référence
  historique, mais n'est plus lu par l'app au runtime — Supabase est
  l'unique source de vérité.
- Une modification enregistrée depuis le mode édition écrit directement
  dans Supabase (plus de brouillon local à télécharger/committer/pousser).
