import { permanentRedirect } from "next/navigation";

/**
 * The canonical home now lives at `/` (src/app/(site)/page.tsx) — the root URL
 * carries the SEO weight and first-time visitors get the one-time splash
 * overlay there. This stub keeps every old /home link working.
 */
export default function HomeRedirect() {
  permanentRedirect("/");
}
