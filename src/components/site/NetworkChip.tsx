"use client";

import { useNetworkSnapshot } from "@/lib/useNetworkSnapshot";

/**
 * Compact network status chip for the footer bottom bar: proof-state dot
 * and the SIMULATED honesty tag the full widget carries.
 * Links to the /status truth table now that it exists.
 */
export function NetworkChip() {
  const { data } = useNetworkSnapshot(8000);
  const status = data?.l2.latestProofStatus ?? "pending";

  return (
    <a
      href="/status"
      className="network-chip"
      aria-label="Network status, simulated telemetry"
      title="Simulated Layer 2 telemetry; open network status"
    >
      <span className="network-chip__dot" data-status={status} aria-hidden />
      <span className="network-chip__label">Network status</span>
      <span className="network-chip__sim" aria-hidden>
        SIM
      </span>
    </a>
  );
}
