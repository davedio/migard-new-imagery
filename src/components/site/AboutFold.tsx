import { Section, Prose, Actions } from "./ui";
import { StackChips } from "./StackChips";
import { GitHubIcon } from "./BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

/* =========================================================================
   AboutFold — the About page's substantive sections (thesis, who-builds-it,
   the Cardano stack), folded onto the home page. The About route was removed;
   its hero, the testnet-status cards, and the closing band were dropped.
   ========================================================================= */

export function ThesisSection() {
  return (
    <Section eyebrow="The thesis" title="UTXO finance, starting with Cardano">
      <Prose
        items={[
          {
            text: "UTXO finance should not have to choose between speed and security. Midgard gives UTXO applications a faster execution layer, starting with Cardano and designed for a broader bridged future.",
          },
          {
            text: "Settlement is rooted in Cardano today. The trust story comes from mathematically verified smart contracts, fault-proof verification, and a smaller eUTXO attack surface.",
            variant: "emph",
          },
        ]}
      />
    </Section>
  );
}

export function AboutFold({ showThesis = true }: { showThesis?: boolean } = {}) {
  return (
    <>
      {showThesis && <ThesisSection />}

      <Section eyebrow="Who builds it" title="Built by Midgard Labs">
        <Prose
          items={[
            {
              text: "Midgard is built by Midgard Labs for UTXO applications that need faster execution, starting with Cardano.",
            },
            {
              text: "The protocol is open and the code can be inspected. Public claims should stay tied to live status, measured benchmarks, and approved protocol parameters.",
              variant: "dim",
            },
          ]}
        />
        <Actions
          items={[
            {
              label: "Read the full story",
              href: "/about",
              variant: "ghost",
            },
            {
              label: "View GitHub",
              href: OFFICIAL_LINKS.github,
              variant: "ghost",
              icon: <GitHubIcon size={15} />,
            },
          ]}
        />
      </Section>

      <Section eyebrow="Built with" title="The starting stack">
        <StackChips />
      </Section>
    </>
  );
}
