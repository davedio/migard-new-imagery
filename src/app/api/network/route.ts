import { mockSnapshot } from "@/lib/network";
import { fetchL1FromBlockfrost } from "@/lib/blockfrost";

// Always run at request time so each poll returns a fresh, live-feeling snapshot.
export const dynamic = "force-dynamic";

export async function GET() {
  const snap = mockSnapshot();

  // L1 goes live the moment a Blockfrost key is present; L2 (Midgard) stays
  // simulated until testnet telemetry exists. Same contract either way, so the
  // UI never changes — only `source` and the L1 numbers do.
  const liveL1 = await fetchL1FromBlockfrost();
  if (liveL1) {
    return Response.json({
      ...snap,
      source: "blockfrost",
      updatedAt: new Date().toISOString(),
      l1: liveL1,
    });
  }

  return Response.json(snap);
}
