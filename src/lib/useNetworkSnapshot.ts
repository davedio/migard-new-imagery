"use client";

import { useQuery } from "@tanstack/react-query";
import { mockSnapshot, NetworkSnapshot } from "./network";

async function fetchSnapshot(): Promise<NetworkSnapshot> {
  const res = await fetch("/api/network", { cache: "no-store" });
  if (!res.ok) throw new Error(`network feed ${res.status}`);
  return NetworkSnapshot.parse(await res.json());
}

// Deterministic first paint: the server-rendered HTML and the client's first
// render must agree, so the initial snapshot must not depend on Date.now()
// (the off-by-a-tick drift between SSR and hydration triggers a mismatch).
// The first poll replaces this with the live, time-based snapshot immediately.
const FIRST_PAINT_MS = Date.UTC(2026, 0, 1);

/**
 * Live network state, polled every few seconds. Falls back to a locally
 * generated snapshot before the first fetch resolves so the scene never
 * starts empty.
 */
export function useNetworkSnapshot(intervalMs = 3000) {
  return useQuery({
    queryKey: ["network-snapshot"],
    queryFn: fetchSnapshot,
    refetchInterval: intervalMs,
    initialData: () => mockSnapshot(FIRST_PAINT_MS),
  });
}
