"use client";

import { useNetworkSnapshot } from "@/lib/useNetworkSnapshot";

const fmt = (n: number) => n.toLocaleString("en-US");

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="metric-row">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

export function NetworkStatusWidget() {
  const { data: snap } = useNetworkSnapshot();
  const live = snap.source !== "demo";

  return (
    <div
      className="panel"
      style={{
        marginTop: 28,
        padding: "14px 16px",
        display: "grid",
        gap: 8,
        maxWidth: 340,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <span className={`chip chip--${live ? "live" : "demo"}`}>
          <span className="dot" />
          {live ? "Live L1 · sim L2" : "Simulated feed"}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            color: "var(--text-faint)",
          }}
        >
          {new Date(snap.updatedAt).toLocaleTimeString("en-US")}
        </span>
      </div>
      <Row k="L1 block" v={`#${fmt(snap.l1.blockHeight)}`} />
      <Row k="Batch queue" v={`${fmt(snap.l2.batchQueueDepth)} ops`} />
      <Row k="Proof" v={snap.l2.latestProofStatus.toUpperCase()} />
    </div>
  );
}
