import { permanentRedirect } from "next/navigation";

/**
 * The canonical home now lives at `/` (src/app/(site)/page.tsx) — the root URL
 * carries the SEO weight. This stub keeps every old /home link working.
 */
export default function HomeRedirect() {
  permanentRedirect("/");
}
