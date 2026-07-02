/* ============================================================
   mockTelemetry — the MOCK side of the live-telemetry contract.

   This module is the single data contract for "how busy is the
   network" UI (firefly density, status chips, HUD readouts).
   Components subscribe through `subscribeTelemetry` and never care
   where the numbers come from.

   ── SWAP POINT ──────────────────────────────────────────────
   TODO(live-l2): replace the bounded random walk below with the
   real Midgard L2 telemetry adapter (websocket or polling) while
   keeping the exported `Telemetry` type and the
   `subscribeTelemetry(cb): unsubscribe` signature IDENTICAL.
   Nothing downstream should need to change — that is the whole
   point of the contract (repo pattern: mock-first data behind one
   contract, same as src/lib/network.ts / useNetworkSnapshot.ts).
   ────────────────────────────────────────────────────────────

   Pure TypeScript. No React. Safe to import anywhere; the interval
   only spins while at least one subscriber is attached.
   ============================================================ */

export type Telemetry = {
  /** rough L2 throughput, transactions per second (mock: 8–40) */
  txPerSec: number;
  /** operators currently committing blocks (mock: 3–7) */
  activeOperators: number;
  /** watchers currently validating the chain (mock: 4–12) */
  activeWatchers: number;
  /** time left in the current fraud-proof challenge window; counts
      down from ~2h and wraps (mock) */
  challengeWindowRemainingMs: number;
};

const TICK_MS = 2000;
const CHALLENGE_WINDOW_MS = 2 * 60 * 60 * 1000; // ~2h

const TX_MIN = 8;
const TX_MAX = 40;
const OPS_MIN = 3;
const OPS_MAX = 7;
const WATCH_MIN = 4;
const WATCH_MAX = 12;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/** One gentle random-walk step: small nudge + a soft pull toward the
    band's centre so the value meanders without pinning to an edge. */
function walk(value: number, step: number, lo: number, hi: number): number {
  const centre = (lo + hi) / 2;
  const nudge = (Math.random() - 0.5) * 2 * step;
  const pull = (centre - value) * 0.06;
  return clamp(value + nudge + pull, lo, hi);
}

/** Occasionally step an integer count by ±1, staying in-band. */
function walkInt(value: number, chance: number, lo: number, hi: number): number {
  if (Math.random() > chance) return value;
  const dir = Math.random() < 0.5 ? -1 : 1;
  return clamp(value + dir, lo, hi);
}

/* ---- module-level generator state (one coherent stream shared by
        every subscriber, like a real feed would be) ---- */

let current: Telemetry = {
  txPerSec: 18,
  activeOperators: 5,
  activeWatchers: 8,
  challengeWindowRemainingMs: CHALLENGE_WINDOW_MS,
};

const subscribers = new Set<(t: Telemetry) => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let lastTickAt = 0;

function step(): void {
  const now = Date.now();
  const elapsed = lastTickAt > 0 ? now - lastTickAt : TICK_MS;
  lastTickAt = now;

  let windowMs = current.challengeWindowRemainingMs - elapsed;
  if (windowMs <= 0) windowMs = CHALLENGE_WINDOW_MS; // window closes, next opens

  current = {
    txPerSec: Math.round(walk(current.txPerSec, 2.6, TX_MIN, TX_MAX) * 10) / 10,
    activeOperators: walkInt(current.activeOperators, 0.2, OPS_MIN, OPS_MAX),
    activeWatchers: walkInt(current.activeWatchers, 0.3, WATCH_MIN, WATCH_MAX),
    challengeWindowRemainingMs: windowMs,
  };
}

/**
 * Subscribe to the telemetry stream. The callback fires immediately
 * with the current snapshot, then every ~2s. Returns an unsubscribe
 * function; the generator idles when nobody is listening.
 */
export function subscribeTelemetry(cb: (t: Telemetry) => void): () => void {
  subscribers.add(cb);
  cb(current); // emit immediately

  if (timer === null) {
    lastTickAt = Date.now();
    timer = setInterval(() => {
      step();
      for (const fn of subscribers) fn(current);
    }, TICK_MS);
  }

  return () => {
    subscribers.delete(cb);
    if (subscribers.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}
