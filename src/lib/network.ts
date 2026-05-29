import { z } from "zod";

/* ============================================================
   NetworkSnapshot — the single data contract the whole UI binds to.
   Build everything against this. Today it is filled by a deterministic
   mock (source: "demo"); at launch a Blockfrost/Koios adapter fills the
   same shape (source: "blockfrost" | "koios") and nothing else changes.
   ============================================================ */

export const ProofStatus = z.enum(["pending", "generated", "settled"]);
export type ProofStatus = z.infer<typeof ProofStatus>;

export const NetworkSnapshot = z.object({
  updatedAt: z.string(),
  source: z.enum(["demo", "blockfrost", "koios"]),
  /** Cardano Layer 1 — the bedrock the structure settles to. */
  l1: z.object({
    blockHeight: z.number(),
    slot: z.number(),
    epoch: z.number(),
    latestBlockHash: z.string(),
    /** txns in the most recent block window */
    txCountWindow: z.number(),
    /** rough transactions-per-second estimate */
    tps: z.number(),
  }),
  /** Midgard Layer 2 — activity, batching, proof, challenge, settlement. */
  l2: z.object({
    latestBatchId: z.string(),
    /** operations waiting to be aggregated into the next batch */
    batchQueueDepth: z.number(),
    /** simulated L2 operations per second */
    throughput: z.number(),
    latestProofStatus: ProofStatus,
    latestSettlementTx: z.string(),
    challengeWindowOpen: z.boolean(),
  }),
});
export type NetworkSnapshot = z.infer<typeof NetworkSnapshot>;

/* ---------- deterministic helpers (stateless, time-driven) ---------- */

// Anchor near the prototype's "BLOCK #4 291 …" so demo numbers read plausibly.
const GENESIS_MS = Date.UTC(2026, 0, 1);
const BASE_BLOCK = 4_291_000;
const BLOCK_SECONDS = 20; // Cardano ~20s between blocks
const BASE_EPOCH = 512;

function hashHex(seed: number, len = 64): string {
  // tiny xorshift-ish pseudo-hash, deterministic from an integer seed
  let x = (seed ^ 0x9e3779b9) >>> 0;
  let out = "";
  while (out.length < len) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    out += x.toString(16).padStart(8, "0");
  }
  return out.slice(0, len);
}

/**
 * Build a believable, smoothly-changing snapshot purely from the clock so it
 * looks alive on every poll without any server-side state.
 */
export function mockSnapshot(now = Date.now()): NetworkSnapshot {
  const elapsed = (now - GENESIS_MS) / 1000;
  const blockTicks = Math.floor(elapsed / BLOCK_SECONDS);
  const blockHeight = BASE_BLOCK + blockTicks;
  const slot = Math.floor(elapsed);
  const epoch = BASE_EPOCH + Math.floor(blockTicks / 21600);

  // L1 activity: a breathing baseline with a faster ripple on top.
  const txCountWindow = Math.round(
    46 + Math.sin(elapsed / 7) * 26 + Math.sin(elapsed / 1.7) * 12 + 14,
  );
  const tps = +(txCountWindow / BLOCK_SECONDS).toFixed(2);

  // L2 batch lifecycle: queue fills over ~18s then a batch is cut and it drains.
  const cyclePos = (elapsed % 18) / 18; // 0..1
  const batchQueueDepth = Math.round(2 + cyclePos * 22);
  const throughput = +(8 + Math.sin(elapsed / 3) * 4 + cyclePos * 9).toFixed(1);
  const batchIndex = Math.floor(elapsed / 18);
  const latestBatchId = `0x${hashHex(batchIndex, 12)}`;

  // Proof lifecycle drives the gold proof aperture: pending → generated → settled.
  const phase = batchIndex % 3;
  const latestProofStatus: ProofStatus =
    phase === 0 ? "pending" : phase === 1 ? "generated" : "settled";
  const challengeWindowOpen = latestProofStatus === "generated";
  const latestSettlementTx = `0x${hashHex(batchIndex * 31 + 7)}`;

  return {
    updatedAt: new Date(now).toISOString(),
    source: "demo",
    l1: {
      blockHeight,
      slot,
      epoch,
      latestBlockHash: `0x${hashHex(blockTicks)}`,
      txCountWindow,
      tps,
    },
    l2: {
      latestBatchId,
      batchQueueDepth,
      throughput,
      latestProofStatus,
      latestSettlementTx,
      challengeWindowOpen,
    },
  };
}
