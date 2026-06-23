import styles from "./m2.module.css";
import { Reveal } from "./Reveal";

const STACK = [
  { name: "Aiken", role: "Validators", href: "https://aiken-lang.org/" },
  { name: "Plutarch", role: "Validators", href: "https://github.com/Plutonomicon/plutarch-plutus" },
  { name: "Haskell", role: "Node", href: "https://www.haskell.org/" },
  { name: "TypeScript", role: "SDK & tooling", href: "https://www.typescriptlang.org/" },
  { name: "Lean4", role: "Formal methods", href: "https://lean-lang.org/" },
  { name: "Ouroboros", role: "Cardano L1 consensus", href: "https://cardano.org/ouroboros/" },
  { name: "Leios", role: "Throughput", href: "https://leios.cardano-scaling.org/" },
];

/** The Cardano-native stack Midgard is built on, as labelled chips that link
 *  out to each project's official site. */
export function StackChips() {
  return (
    <div className={styles.stack}>
      {STACK.map((s, i) => (
        <Reveal key={s.name} delay={i * 30} style={{ display: "inline-block" }}>
          <a
            className={styles.stackChip}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${s.name} — ${s.role} (opens ${s.href} in a new tab)`}
          >
            <span className={styles.stackName}>
              {s.name}
              <span className={styles.stackExt} aria-hidden>
                ↗
              </span>
            </span>
            <span className={styles.stackRole}>{s.role}</span>
          </a>
        </Reveal>
      ))}
    </div>
  );
}
