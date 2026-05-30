/* Midgard UI Kit — Live HUD + deterministic mock snapshot (port of src/lib/network.ts) */
const { useState: useStateH, useEffect: useEffectH } = React;

const GENESIS_MS = Date.UTC(2026, 0, 1);
const BASE_BLOCK = 4291000, BLOCK_SECONDS = 20, BASE_EPOCH = 512;

function hashHex(seed, len = 64) {
  let x = (seed ^ 0x9e3779b9) >>> 0, out = "";
  while (out.length < len) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0; out += x.toString(16).padStart(8, "0"); }
  return out.slice(0, len);
}
function mockSnapshot(now = Date.now()) {
  const elapsed = (now - GENESIS_MS) / 1000;
  const blockTicks = Math.floor(elapsed / BLOCK_SECONDS);
  const blockHeight = BASE_BLOCK + blockTicks;
  const epoch = BASE_EPOCH + Math.floor(blockTicks / 21600);
  const txCountWindow = Math.round(46 + Math.sin(elapsed / 7) * 26 + Math.sin(elapsed / 1.7) * 12 + 14);
  const cyclePos = (elapsed % 18) / 18;
  const batchQueueDepth = Math.round(2 + cyclePos * 22);
  const throughput = +(8 + Math.sin(elapsed / 3) * 4 + cyclePos * 9).toFixed(1);
  const batchIndex = Math.floor(elapsed / 18);
  const phase = batchIndex % 3;
  const latestProofStatus = phase === 0 ? "pending" : phase === 1 ? "generated" : "settled";
  return {
    updatedAt: new Date(now).toISOString(),
    l1: { blockHeight, epoch, latestBlockHash: "0x" + hashHex(blockTicks), txCountWindow, tps: +(txCountWindow / BLOCK_SECONDS).toFixed(2) },
    l2: { latestBatchId: "0x" + hashHex(batchIndex, 12), batchQueueDepth, throughput, latestProofStatus, challengeWindowOpen: latestProofStatus === "generated" },
  };
}

const fmt = (n) => n.toLocaleString("en-US");

function useSnapshot() {
  const [snap, setSnap] = useStateH(() => mockSnapshot());
  useEffectH(() => {
    const id = setInterval(() => setSnap(mockSnapshot()), 1000);
    return () => clearInterval(id);
  }, []);
  return snap;
}

function MetricRow({ k, v }) {
  return <div className="metric-row"><span className="k">{k}</span><span className="v">{v}</span></div>;
}

/* pinned top-right — tracks the live testnet snapshot */
function LiveHUD({ snap }) {
  const time = new Date(snap.updatedAt).toLocaleTimeString("en-US");
  return (
    <div className="panel" style={{
      position: "fixed", right: "clamp(16px,4vw,40px)", top: 78, zIndex: 40,
      padding: "12px 15px", display: "grid", gap: 7, minWidth: 240,
      background: "linear-gradient(180deg, rgba(215,226,216,0.025), transparent 40%), rgba(12,22,16,0.82)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
        <span className="chip chip--live"><span className="dot" />Live L1 · sim L2</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>{time}</span>
      </div>
      <MetricRow k="L1 block" v={`#${fmt(snap.l1.blockHeight)}`} />
      <MetricRow k="Batch queue" v={`${fmt(snap.l2.batchQueueDepth)} ops`} />
      <MetricRow k="Proof" v={snap.l2.latestProofStatus.toUpperCase()} />
    </div>
  );
}

Object.assign(window, { useSnapshot, LiveHUD, mockSnapshot, fmt });
