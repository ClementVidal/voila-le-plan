import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error(
    "VITE_SUPABASE_URL et/ou VITE_SUPABASE_ANON_KEY manquantes — voir docs/supabase.md pour la configuration.",
  );
}

/**
 * La clé "anon" est publique par construction (elle finit dans le bundle
 * JS) : la sécurité vient des policies RLS côté base, pas du secret de
 * cette clé. Voir supabase/migrations/0001_init.sql.
 *
 * `createClient` lève une exception synchrone si l'URL est vide/invalide,
 * ce qui ferait planter tout le rendu React avant même d'afficher le
 * message d'erreur ci-dessus : on retombe sur une URL factice syntaxiquement
 * valide, dont les appels échoueront proprement (capturés par
 * useMechanismData) plutôt que de faire planter l'app entière.
 */
export const supabase = createClient(url || "https://misconfigured.supabase.co", anonKey || "misconfigured");
