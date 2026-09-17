import { useEffect, useState } from "react";
import { fetchPublishedMechanismData, type MechanismData } from "./mechanismData";
import { validateMechanismData } from "./validateMechanismData";

export type MechanismDataState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: MechanismData };

/** Charge le graphe publié depuis Supabase (lecture publique, voir la policy RLS). */
export function useMechanismData(): MechanismDataState {
  const [state, setState] = useState<MechanismDataState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetchPublishedMechanismData()
      .then((data) => {
        if (cancelled) return;
        const result = validateMechanismData(data);
        if (!result.valid) {
          setState({
            status: "error",
            message: `Le graphe publié ne respecte pas le schéma : ${result.errors[0]?.path} ${result.errors[0]?.message}`,
          });
          return;
        }
        setState({ status: "ready", data: result.data! });
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
