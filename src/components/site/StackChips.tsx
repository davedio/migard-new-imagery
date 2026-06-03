import styles from "./m2.module.css";
import { Reveal } from "./Reveal";

const STACK = [
  { name: "Aiken", role: "Validators" },
  { name: "Plutarch", role: "Validators" },
  { name: "Haskell", role: "Node" },
  { name: "TypeScript", role: "SDK & tooling" },
  { name: "Lean4", role: "Formal methods" },
  { name: "Ouroboros", role: "L1 consensus" },
  { name: "Leios", role: "Throughput" },
];

/** The Cardano-native stack Midgard is built on, as labelled chips. */
export function StackChips() {
  return (
    <div className={styles.stack}>
      {STACK.map((s, i) => (
        <Reveal key={s.name} delay={i * 30} style={{ display: "inline-block" }}>
          <div className={styles.stackChip}>
            <span className={styles.stackName}>{s.name}</span>
            <span className={styles.stackRole}>{s.role}</span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
