import { useEffect, useState } from "react";
import { DRAFT_STORAGE_KEY, fetchPublishedMechanismData, type MechanismData } from "./mechanismData";
import { validateMechanismData } from "./validateMechanismData";

export type MechanismDataState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: MechanismData; source: "draft" | "published" };

/**
 * Charge les données qui pilotent la vue mécanisme : un brouillon local
 * (édité sur `/edit`, jamais publié) prime sur le JSON publié, pour une
 * prévisualisation immédiate sans redéploiement (§10 : « application des
 * règles de validation en direct »).
 */
export function useMechanismData(): MechanismDataState {
  const [state, setState] = useState<MechanismDataState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const draftRaw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draftRaw) {
      try {
        const result = validateMechanismData(JSON.parse(draftRaw));
        if (result.valid && result.data) {
          setState({ status: "ready", data: result.data, source: "draft" });
          return;
        }
      } catch {
        // Brouillon corrompu : on ignore silencieusement et on retombe sur le JSON publié.
      }
    }

    fetchPublishedMechanismData()
      .then((data) => {
        if (cancelled) return;
        const result = validateMechanismData(data);
        if (!result.valid) {
          setState({
            status: "error",
            message: `Le JSON publié ne respecte pas le schéma : ${result.errors[0]?.path} ${result.errors[0]?.message}`,
          });
          return;
        }
        setState({ status: "ready", data: result.data!, source: "published" });
      })
      .catch((cause: Error) => {
        if (!cancelled) setState({ status: "error", message: cause.message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
