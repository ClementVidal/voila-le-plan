import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";

/**
 * La lecture (vue mécanisme) reste publique — voir §1 du document de
 * passation, outil grand public. Seule l'édition (bouton + sauvegarde)
 * nécessite une connexion Google, appliquée côté base par les policies
 * RLS sur `graphs` (supabase/migrations/0001_init.sql), pas seulement ici.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    loading: session === undefined,
    isAuthenticated: Boolean(session),
    email: session?.user.email ?? null,
    signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: "google" }),
    signOut: () => supabase.auth.signOut(),
  };
}
