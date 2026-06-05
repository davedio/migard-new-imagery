import { redirect } from "next/navigation";

// Testnet status was merged into the Contracts page (live status + state queue
// now live there). Keep the old route working.
export default function TestnetRedirect() {
  redirect("/contracts");
}
