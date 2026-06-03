"use client";

import { useState } from "react";
import styles from "./m2.module.css";

type Net = "l1" | "l2";

const NETS: Record<Net, { label: string; endpoint: string; network: string }> = {
  l1: {
    label: "Cardano L1",
    endpoint: "https://cardano-preprod.blockfrost.io/api/v0",
    network: "Preprod",
  },
  l2: {
    label: "Midgard L2",
    endpoint: "https://rpc.midgard.testnet/v0",
    network: "Midgard",
  },
};

/**
 * "Almost nothing changes" — toggling the target network swaps only the
 * endpoint and network identifier (highlighted). The validator, datum,
 * redeemer, and tooling are identical. Endpoints are illustrative (pre-alpha).
 */
export function DeveloperSwitch() {
  const [net, setNet] = useState<Net>("l2");
  const cfg = NETS[net];

  return (
    <div className={styles.switch}>
      <div className={styles.switchBar}>
        <span className={styles.switchFile}>cardano-or-midgard.ts</span>
        <div className={styles.switchToggle} role="tablist" aria-label="Target network">
          {(["l1", "l2"] as Net[]).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={net === k}
              className={styles.switchBtn}
              data-net={k}
              data-active={net === k}
              onClick={() => setNet(k)}
            >
              {NETS[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.switchPanel} data-net={net}>
        <pre className={styles.code}>
          <code>
            <span className={styles.codeLine}>
              <span className={styles.tok}>import</span>
              {" { Lucid, Blockfrost } "}
              <span className={styles.tok}>from</span>{" "}
              <span className={styles.str}>&quot;@lucid-evolution/lucid&quot;</span>;
            </span>
            <span className={styles.codeLine}> </span>
            <span className={styles.codeLine}>
              <span className={styles.tok}>const</span> lucid ={" "}
              <span className={styles.tok}>await</span> Lucid(
            </span>
            <span className={`${styles.codeLine} ${styles.codeLineChanged}`}>
              {"  "}
              <span className={styles.tok}>new</span> Blockfrost(
              <span className={styles.strNet}>&quot;{cfg.endpoint}&quot;</span>, projectId),
            </span>
            <span className={`${styles.codeLine} ${styles.codeLineChanged}`}>
              {"  "}
              <span className={styles.strNet}>&quot;{cfg.network}&quot;</span>,
            </span>
            <span className={styles.codeLine}>);</span>
            <span className={styles.codeLine}> </span>
            <span className={styles.codeLine}>
              <span className={styles.cmt}>{"// same validator, same datum, same redeemer"}</span>
            </span>
            <span className={styles.codeLine}>
              <span className={styles.tok}>await</span> lucid.newTx()
            </span>
            <span className={styles.codeLine}>{"  .collectFrom([utxo], redeemer)"}</span>
            <span className={styles.codeLine}>{"  .attach.SpendingValidator(validator)"}</span>
            <span className={styles.codeLine}>{"  .complete();"}</span>
          </code>
        </pre>
      </div>

      <div className={styles.switchCaption}>
        Same eUTXO model, scripts, and tooling — only the endpoint and network
        change. Endpoint shown is illustrative (pre-alpha).
      </div>
    </div>
  );
}
