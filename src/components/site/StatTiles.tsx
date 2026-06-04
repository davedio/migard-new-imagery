import styles from "./m2.module.css";
import { Reveal } from "./Reveal";

type Tile = { label: string; value: string; sub: string; accent?: "green" | "gold" };

const TILES: Tile[] = [
  { label: "Usable in seconds", value: "Seconds", sub: "instant, usable confirmation", accent: "green" },
  { label: "Fully settled", value: "3–7 days", sub: "L1 challenge window", accent: "gold" },
  { label: "Throughput", value: "Up to 300×", sub: "faster than L1 alone" },
  { label: "Fraud proofs", value: "eUTXO-targeted", sub: "surgical, not global" },
  { label: "Fees", value: "ADA", sub: "settled on Cardano L1" },
  { label: "Status", value: "Pre-alpha", sub: "Cardano preprod testnet", accent: "gold" },
];

/** A compact strip of at-a-glance protocol facts. */
export function StatTiles() {
  return (
    <div className={styles.stats}>
      {TILES.map((t, i) => (
        <Reveal key={t.label} delay={i * 40} style={{ display: "block" }}>
          <div className={styles.statTile}>
            <div className={styles.statLabel}>{t.label}</div>
            <div className={styles.statValue} data-accent={t.accent}>
              {t.value}
            </div>
            <div className={styles.statSub}>{t.sub}</div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
