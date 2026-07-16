import MinimalHome from "@/components/minimal/MinimalHome";

/**
 * Canonical home at `/`, inside the (site) group so it shares nav + footer.
 * This branch uses the minimalist tree-themed direction as the primary
 * experience.
 */
export default function HomePage() {
  return <MinimalHome />;
}
