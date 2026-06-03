import styles from "./m2.module.css";
import { Reveal } from "./Reveal";

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className={styles.markGood} aria-hidden>
      <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className={styles.markBad} aria-hidden>
      <path d="M4 8h8" strokeLinecap="round" />
    </svg>
  );
}

const GOOD = [
  "Minimal data to verify a proof",
  "Cheap, conclusive L1 verification",
  "Lower bar to run a Watcher",
  "No global state scan",
];
const BAD = [
  "Large data footprint",
  "Expensive L1 verification",
  "Heavier hardware for watchers",
  "Fewer independent watchers",
];

/** Side-by-side: why eUTXO makes fraud proofs surgical vs. account-model replay. */
export function EutxoComparison() {
  return (
    <div className={styles.compare}>
      <Reveal style={{ display: "block" }}>
        <div className={styles.compareCol} data-tone="good">
          <span className={styles.compareKicker}>Midgard · eUTXO</span>
          <h3 className={styles.compareTitle}>Surgical fraud proofs</h3>
          <p className={styles.compareThesis}>
            Deterministic eUTXO execution means a fraud proof re-runs only the
            specific inputs of a bad transaction — the referenced inputs, the
            validator, and the transaction hash. Verification is fast, cheap,
            and conclusive on Cardano L1.
          </p>
          <ul className={styles.compareList}>
            {GOOD.map((x) => (
              <li key={x} className={styles.compareItem}>
                <CheckIcon />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delay={80} style={{ display: "block" }}>
        <div className={styles.compareCol} data-tone="bad">
          <span className={styles.compareKicker}>Account-model rollups</span>
          <h3 className={styles.compareTitle}>Global state replay</h3>
          <p className={styles.compareThesis}>
            Account-based rollups replay transactions against shared global
            state across many contracts to prove fraud — heavier data, more
            computation, and higher operating cost to verify on L1.
          </p>
          <ul className={styles.compareList}>
            {BAD.map((x) => (
              <li key={x} className={styles.compareItem}>
                <DashIcon />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
