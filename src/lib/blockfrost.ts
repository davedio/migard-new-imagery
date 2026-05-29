import type { NetworkSnapshot } from "./network";

/* ============================================================
   Blockfrost L1 adapter.

   Fills the `l1` portion of the NetworkSnapshot contract with real
   Cardano data when a project key is present. Returns null whenever
   no key is configured or the request fails, so the route handler
   transparently falls back to the deterministic mock — today's
   default behaviour is unchanged until BLOCKFROST_PROJECT_ID is set.

   Get a free project id at https://blockfrost.io (one per network).
   ============================================================ */

type L1 = NetworkSnapshot["l1"];

const HOSTS: Record<string, string> = {
  mainnet: "https://cardano-mainnet.blockfrost.io/api/v0",
  preprod: "https://cardano-preprod.blockfrost.io/api/v0",
  preview: "https://cardano-preview.blockfrost.io/api/v0",
};

// Cardano makes a block roughly every ~20s; used to turn a block's tx
// count into a rough tps estimate (matches the mock's convention).
const BLOCK_SECONDS = 20;

// Subset of the /blocks/latest response we rely on.
type BlockfrostBlock = {
  height: number | null;
  slot: number | null;
  epoch: number | null;
  hash: string;
  tx_count: number;
};

export async function fetchL1FromBlockfrost(): Promise<L1 | null> {
  const projectId = process.env.BLOCKFROST_PROJECT_ID;
  if (!projectId) return null;

  const network = process.env.BLOCKFROST_NETWORK ?? "mainnet";
  const host = HOSTS[network] ?? HOSTS.mainnet;

  try {
    const res = await fetch(`${host}/blocks/latest`, {
      headers: { project_id: projectId },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;

    const b = (await res.json()) as BlockfrostBlock;
    if (typeof b.height !== "number" || typeof b.tx_count !== "number") {
      return null;
    }

    return {
      blockHeight: b.height,
      slot: b.slot ?? 0,
      epoch: b.epoch ?? 0,
      latestBlockHash: b.hash.startsWith("0x") ? b.hash : `0x${b.hash}`,
      txCountWindow: b.tx_count,
      tps: +(b.tx_count / BLOCK_SECONDS).toFixed(2),
    };
  } catch {
    return null;
  }
}
