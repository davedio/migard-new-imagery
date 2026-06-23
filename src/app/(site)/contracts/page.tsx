import type { Metadata } from "next";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { ContractTopology } from "@/components/site/ContractTopology";
import { CopyField } from "@/components/site/CopyField";
import RuneDecode from "@/components/site/RuneDecode";
import { Actions, CtaBand, Layers, Prose, Section } from "@/components/site/ui";
import {
  CONTRACTS,
  CONTRACTS_META,
  GENESIS_TIMELINE,
  REFERENCE_SCRIPTS,
  STATE_ANCHORS,
  explorerAddress,
  explorerTx,
} from "@/lib/contracts";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import styles from "@/components/site/contracts.module.css";

export const metadata: Metadata = {
  title: "Contracts | Midgard",
  description:
    "Midgard protocol contracts: validator topology, preprod addresses, state anchors, reference scripts, and genesis deployment history.",
  openGraph: {
    title: "Contracts | Midgard",
    images: [{ url: "/og/contracts.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/contracts.jpg"] },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://midgard-gateway.vercel.app/" },
    { "@type": "ListItem", position: 2, name: "Developers", item: "https://midgard-gateway.vercel.app/developers" },
    { "@type": "ListItem", position: 3, name: "Contracts", item: "https://midgard-gateway.vercel.app/contracts" },
  ],
};

export default function ContractsPage() {
  return (
    <main className={`page-main contracts-page ${styles.contractsPage}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RuneDecode />

      <header className={styles.contractHero} data-contracts-hero>
        <div className={styles.contractHeroPlate} aria-hidden />
        <div className={styles.contractHeroInner}>
          <div className={styles.contractHeroCopy}>
            <h1 data-rune-target>Inspect the contract path.</h1>
            <p data-rune-target>
              Every Midgard validator, state anchor, reference script, and bootstrap transaction should be checkable from one place.
            </p>
            <div className={styles.contractHeroChips}>
              <span className="chip chip--testnet">
                <span className="dot" />
                Pre-alpha testnet
              </span>
              <span className="chip chip--demo">
                <span className="dot" />
                Static preprod snapshot
              </span>
            </div>
            <Actions
              items={[
                { label: "View topology", href: "#topology", variant: "primary" },
                {
                  label: "Open GitHub",
                  href: OFFICIAL_LINKS.github,
                  variant: "ghost",
                  icon: <GitHubIcon size={15} />,
                },
              ]}
            />
          </div>
          <div className={styles.runePanel} aria-label="Contracts inspection map">
            <span className={styles.runePanelGlyphs} aria-hidden>
              ᚠᚢᚦᚨ · ᚱᚲᚷᚹ · ᛉᛊᛏᛒ
            </span>
            <div>
              <strong>Validator topology</strong>
              <span>Hub Oracle, Scheduler, State Queue, Settlement</span>
            </div>
            <div>
              <strong>State anchors</strong>
              <span>NFT-marked UTxOs that record protocol state in this snapshot</span>
            </div>
            <div>
              <strong>Reference scripts</strong>
              <span>On-chain scripts transactions can point to directly</span>
            </div>
            <div>
              <strong>Genesis history</strong>
              <span>Bootstrap transactions from initialization to first confirmed state</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="page-sticky-toc" aria-label="On this page">
        <a href="#topology">Topology</a>
        <a href="#addresses">Validators</a>
        <a href="#anchors">State anchors</a>
        <a href="#refs">Reference scripts</a>
        <a href="#history">Genesis</a>
        <a href="#security-model">Security</a>
        <a href="#query">Query</a>
      </nav>

      <Section id="topology" title="The protocol surface." lead="The topology makes the contract system easier to inspect before the address directory gets detailed.">
        <div className={styles.metaBar}>
          <span className={styles.metaActive}>
            <span className={styles.metaDot} />
            {CONTRACTS_META.network} · Preprod snapshot
          </span>
          <span className={styles.metaSep}>·</span>
          <span>{CONTRACTS_META.era} era</span>
          <span className={styles.metaSep}>·</span>
          <span>Epoch {CONTRACTS_META.epoch} static</span>
          <span className={styles.metaSep}>·</span>
          <span>Genesis: {CONTRACTS_META.genesisDate}</span>
          <a className={styles.metaLink} href={CONTRACTS_META.explorer} target="_blank" rel="noreferrer">
            cexplorer.io
          </a>
        </div>
        <Prose
          items={[
            {
              text: "Hub Oracle anchors the registry. Scheduler and State Queue coordinate commitments. Settlement, Deposit, Tx Order, and Withdrawal handle the user bridge. The fault-proof path routes invalid state back through a verifiable challenge surface.",
            },
          ]}
        />
        <ContractTopology />
      </Section>

      <Section
        id="addresses"
        title="Core validators."
        lead="Open any preprod address on the explorer or copy it for your own tooling."
        glow="green"
      >
        <div className={styles.directory}>
          {CONTRACTS.map((contract) => (
            <div className={styles.contractRow} data-accent={contract.accent} key={contract.name}>
              <div className={styles.contractHead}>
                <span className={styles.contractName}>{contract.name}</span>
                <span className={styles.tag}>{contract.tag}</span>
              </div>
              <p className={styles.contractDesc}>{contract.desc}</p>
              <div className={styles.addrLine}>
                <span className={styles.addrLabel}>addr</span>
                <CopyField
                  value={contract.address}
                  href={explorerAddress(contract.address)}
                  label={`${contract.name} address`}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="anchors" title="State anchors." lead="Each anchor is an NFT-marked UTxO that records protocol state in this snapshot.">
        <div className={styles.anchorsGrid}>
          {STATE_ANCHORS.map((anchor) => (
            <div className={styles.anchorCard} key={anchor.name}>
              <div className={styles.anchorHead}>
                <span className={styles.anchorName}>{anchor.name}</span>
                <span className={styles.anchorRole}>{anchor.role}</span>
              </div>
              <CopyField value={anchor.utxo} href={explorerTx(anchor.utxo)} label={`${anchor.name} UTxO`} />
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="refs"
        title="Reference scripts."
        lead="Validators are deployed once as on-chain reference scripts so transactions can point to them."
        glow="gold"
      >
        <div className={styles.refList}>
          {REFERENCE_SCRIPTS.map((script) => (
            <div className={styles.refRow} key={script.name}>
              <span className={styles.refName}>{script.name}</span>
              <CopyField value={script.hash} label={`${script.name} script hash`} />
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="history"
        title="Genesis deployment history."
        lead={`From protocol initialization to the first confirmed state in about ${CONTRACTS_META.genesisToConfirmed}.`}
      >
        <div className={styles.timeline}>
          {GENESIS_TIMELINE.map((event) => (
            <div className={`${styles.tItem}${event.genesis ? ` ${styles.tItemGenesis}` : ""}`} key={event.tx}>
              <div className={styles.tHead}>
                <span className={styles.tTime}>{event.time}</span>
                <span className={styles.tAction}>{event.action}</span>
                {event.genesis ? <span className={`${styles.tBadge} ${styles.tBadgeGenesis}`}>Genesis</span> : null}
                {event.note ? <span className={`${styles.tBadge} ${styles.tNote}`}>{event.note}</span> : null}
              </div>
              <div className={styles.tTx}>
                <CopyField value={event.tx} href={explorerTx(event.tx)} label="transaction" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="security-model"
        title="Security model."
        lead="The contracts matter because they make invalid state contestable and final settlement inspectable."
      >
        <Layers
          items={[
            {
              n: "01",
              name: "Fast first",
              desc: "Users can receive soft confirmation before final settlement.",
            },
            {
              n: "02",
              name: "Challengeable state",
              desc: "Watchers replay commitments and use the fault-proof path if a commitment is invalid.",
            },
            {
              n: "03",
              name: "L1 settlement",
              desc: "Verified state settles through the base-layer contract path.",
            },
          ]}
        />
        <Actions items={[{ label: "Read security", href: "/security", variant: "ghost" }]} />
      </Section>

      <Section
        id="query"
        title="Query the contracts yourself."
        lead="Use the listed State Queue address with your own preprod tooling."
      >
        <div className={styles.codeBlock}>
          <div className={styles.codeHead}>
            <span className={styles.codeDot} />
            read-state-queue.ts
          </div>
          <pre className={styles.code}>
            <code>{`import { Lucid, Blockfrost } from "@lucid-evolution/lucid";

const lucid = await Lucid(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", projectId),
  "Preprod",
);

const stateQueue =
  "addr_test1wqkh8medgake46f96ztg37etwgfpgz32zcz353f08jvw90ggse5ey";

const utxos = await lucid.utxosAt(stateQueue);
console.log(\`\${utxos.length} entries at the State Queue address\`);`}</code>
          </pre>
        </div>
      </Section>

      <CtaBand
        title="Verify before you trust."
        lead="Contracts, source, and security assumptions should be easy to inspect before anyone treats performance claims as meaningful."
        actions={[
          { label: "Open GitHub", href: OFFICIAL_LINKS.github, variant: "primary", icon: <GitHubIcon size={15} /> },
          { label: "Read security", href: "/security", variant: "ghost" },
        ]}
      />
    </main>
  );
}
