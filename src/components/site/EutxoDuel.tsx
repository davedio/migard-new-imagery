import { Reveal } from "@/components/site/Reveal";

/* ============================================================
   EutxoDuel — the side-by-side fault-proof comparison (Midgard's
   UTXO-local proof path vs account-model global replay). Relocated from the
   home proofs chapter to the FAQ (2026-06-11), inline with the
   security questions it answers. Styling rides the shared .v2-duel
   rules in v2.css.
   ============================================================ */

const DUEL = {
  us: {
    tag: "Midgard · UTXO",
    title: "Targeted fault proofs",
    thesis:
      "Deterministic UTXO execution means a fault proof re-runs only the specific inputs of a bad transaction: the referenced inputs, the validator, and the transaction hash. Verification is focused and less global than account-model replay.",
    points: [
      "Minimal data to verify a proof",
      "Focused Cardano L1 verification",
      "Lower bar to run a Watcher",
      "No global state scan",
    ],
  },
  them: {
    tag: "Account-model rollups",
    title: "Global state replay",
    thesis:
      "Account-based rollups replay transactions against shared global state across many contracts to prove invalid state: heavier data, more computation, and higher operating cost to verify on L1.",
    points: [
      "Large data footprint",
      "Expensive L1 verification",
      "Heavier hardware for Watchers",
      "Fewer independent Watchers",
    ],
  },
};

export function EutxoDuel() {
  return (
    <Reveal>
      <div className="v2-duel">
        {(["us", "them"] as const).map((side) => {
          const d = DUEL[side];
          return (
            <div className="v2-duel__side" data-side={side} key={side}>
              <span className="tag">{d.tag}</span>
              <h3>{d.title}</h3>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: "var(--text-dim)",
                }}
              >
                {d.thesis}
              </p>
              <ul>
                {d.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
