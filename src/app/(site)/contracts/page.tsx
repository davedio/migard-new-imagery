import type { Metadata } from "next";
import {
  PageHero,
  Section,
  Prose,
  CtaBand,
  Layers,
  Actions,
} from "@/components/site/ui";
import { NextSteps } from "@/components/site/NextSteps";
import { Reveal } from "@/components/site/Reveal";
import { ContractTopology } from "@/components/site/ContractTopology";
import { NetworkStatusWidget } from "@/components/site/NetworkStatusWidget";
import { CopyField } from "@/components/site/CopyField";
import { Term } from "@/components/site/Term";
import RuneDecode from "@/components/site/RuneDecode";
import { StackChips } from "@/components/site/StackChips";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { GitHubIcon } from "@/components/site/BrandIcons";
import {
  CONTRACTS,
  CONTRACTS_META,
  STATE_ANCHORS,
  REFERENCE_SCRIPTS,
  GENESIS_TIMELINE,
  explorerAddress,
  explorerTx,
} from "@/lib/contracts";
import styles from "@/components/site/contracts.module.css";

export const metadata: Metadata = {
  title: "Midgard Contracts & Testnet Status",
  description:
    "Midgard testnet status plus every validator, state anchor, reference script, and bootstrap transaction on Cardano preprod — live network status, verifiable addresses, the genesis deployment history, and the security model that keeps it honest.",
  openGraph: {
    title: "Midgard Contracts & Testnet Status",
    images: [{ url: "/og/contracts.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/contracts.jpg"] },
};


/* The five lifecycle beats, in plain text — relocated from /how-it-works:
   this page holds the validators that ENFORCE them, so the recap lives
   beside the addresses. */
const STEPS = [
  {
    id: "step-submit",
    num: "01",
    tag: "Off-chain · L2",
    title: "Submit",
    body: (
      <>
        A transaction enters Midgard and is validated against{" "}
        <Term k="eutxo">eUTXO</Term> rules immediately. You get a soft
        confirmation in moments, with no Cardano block wait.
      </>
    ),
  },
  {
    id: "step-sequence",
    num: "02",
    tag: "L2 operator",
    title: "Sequence",
    body: (
      <>
        The <Term k="operator">operator</Term> orders incoming transactions
        and assembles them into a Layer 2 block, fixing the order the chain
        will execute.
      </>
    ),
  },
  {
    id: "step-commit",
    num: "03",
    tag: "L1 state queue",
    title: "Commit",
    body: (
      <>
        The <Term k="batcher">batcher</Term> posts a compact{" "}
        <Term k="state-commitment">state commitment</Term> for the block to
        Cardano, where it enters the on-chain state queue for anyone to
        inspect.
      </>
    ),
  },
  {
    id: "step-watch",
    num: "04",
    tag: "Challenge window",
    title: "Watch",
    body: (
      <>
        Independent <Term k="watcher">watchers</Term> re-execute the block
        during the <Term k="challenge-window">challenge window</Term>. An
        invalid commitment can be removed by a single{" "}
        <Term k="fraud-proof">fraud proof</Term>.
      </>
    ),
  },
  {
    id: "step-settle",
    num: "05",
    tag: "L1 confirmed",
    title: "Settle",
    body: (
      <>
        No fraud and maturity ends: the block merges into confirmed state.{" "}
        <Term k="settlement">Settlement</Term> makes it as final as Cardano
        itself.
      </>
    ),
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://midgard-gateway.vercel.app/" },
    { "@type": "ListItem", position: 2, name: "Contracts", item: "https://midgard-gateway.vercel.app/contracts" },
  ],
};

export default function ContractsPage() {
  return (
    <main className="page-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* the opening incantation: runes decode into English down the page */}
      <RuneDecode />
      <PageHero
        tone="ember"
        label="Protocol contracts"
        title="Inspect the on-chain path"
        sub="Every Midgard validator, state anchor, and bootstrap transaction on Cardano preprod — addresses you can open on an explorer and verify yourself, and the security model that keeps them honest."
        chips={
          <>
            <span className="chip chip--testnet">
              <span className="dot" />
              Pre-alpha testnet
            </span>
            <span className="chip chip--demo">
              <span className="dot" />
              Static preprod snapshot · live query planned
            </span>
          </>
        }
        actions={[
          { label: "Network status", href: "#network-status", variant: "primary" },
          { label: "View topology", href: "#topology", variant: "ghost" },
        ]}
      />

      {/* Sticky in-page TOC — the page is long and reference-heavy */}
      <nav className="page-sticky-toc" aria-label="On this page">
        <a href="#network-status">Status</a>
        <a href="#lifecycle">Lifecycle</a>
        <a href="#topology">Topology</a>
        <a href="#addresses">Validators</a>
        <a href="#anchors">State anchors</a>
        <a href="#refs">Reference scripts</a>
        <a href="#history">Genesis history</a>
        <a href="#security-model">Security</a>
      </nav>

      {/* Live network status (moved from the testnet page) */}
      <Section id="network-status" eyebrow="Network status" title="What's live right now">
        <Prose
          items={[
            {
              text: "Live: the preprod contracts and their addresses (below), the source on GitHub, and the genesis deployment history.",
            },
            {
              text: "Simulated: the moving network activity below — it will connect to live data at launch.",
              variant: "dim",
            },
          ]}
        />
        <NetworkStatusWidget />
      </Section>

      {/* The protocol lifecycle, in plain text (relocated from /how-it-works:
          these are the beats the validators below enforce) */}
      <Section
        id="lifecycle"
        eyebrow="The five steps"
        title="The lifecycle these contracts enforce"
        tight
      >
        <p className="body" style={{ maxWidth: "62ch" }}>
          Midgard is a Cardano-native{" "}
          <Term k="optimistic-rollup">optimistic rollup</Term>: execution
          happens on a fast Layer 2, and every result settles back to Cardano
          — through the validators listed on this page.
        </p>
        <div className="hiw-steps" style={{ marginTop: 26 }}>
          {STEPS.map((s) => (
            <article className="hiw-step-card" id={s.id} key={s.id}>
              <span className="hiw-step-card__num">{s.num}</span>
              <span className="hiw-step-card__tag">{s.tag}</span>
              <h3 className="hiw-step-card__title">{s.title}</h3>
              <p className="hiw-step-card__body">{s.body}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* 01 — Topology (the state-queue animation now lives on /how-it-works,
          inside the journey it illustrates) */}
      <Section
        id="topology"
        eyebrow="01 · Contract topology"
        title="Thirteen validators. One protocol"
      >
        <div className={styles.metaBar}>
          <span className={styles.metaActive}>
            <span className={styles.metaDot} />
            {CONTRACTS_META.network} · Active
          </span>
          <span className={styles.metaSep}>·</span>
          <span>{CONTRACTS_META.era} era</span>
          <span className={styles.metaSep}>·</span>
          <span title="Static snapshot; live Blockfrost query planned">
            Epoch {CONTRACTS_META.epoch} (static)
          </span>
          <span className={styles.metaSep}>·</span>
          <span>Genesis: {CONTRACTS_META.genesisDate}</span>
          <a
            className={styles.metaLink}
            href={CONTRACTS_META.explorer}
            target="_blank"
            rel="noreferrer"
          >
            cexplorer.io ↗
          </a>
        </div>

        <Reveal>
          <p className="lead" style={{ maxWidth: "68ch", marginTop: 24 }}>
            Thirteen Aiken validators make up the protocol. Hub Oracle is the
            registry every other script reads from. The Operator Directory —
            active, registered, and retired — tracks the operator set referenced
            by the Scheduler, State Queue, and Settlement. The fraud-proof system
            (gold) lets anyone challenge a committed block through a verifiable
            computation thread. Hover any node to trace its connections.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <ContractTopology />
        </Reveal>
      </Section>

      {/* 02 — Script addresses */}
      <Section
        id="addresses"
        eyebrow="02 · Script addresses"
        title="Seven core validators"
        lead="Live preprod script addresses. Open any address on the explorer to inspect its UTxOs, or copy it for your own tooling."
        glow="green"
      >
        <div className={styles.directory}>
          {CONTRACTS.map((c, i) => (
            <Reveal key={c.name} delay={i * 50}>
              <div className={styles.contractRow} data-accent={c.accent}>
                <div className={styles.contractHead}>
                  <span className={styles.contractName}>{c.name}</span>
                  <span className={styles.tag}>{c.tag}</span>
                </div>
                <p className={styles.contractDesc}>{c.desc}</p>
                <div className={styles.addrLine}>
                  <span className={styles.addrLabel}>addr</span>
                  <CopyField
                    value={c.address}
                    href={explorerAddress(c.address)}
                    label={`${c.name} address`}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 03 — State anchors */}
      <Section
        id="anchors"
        eyebrow="03 · State anchors"
        title="Live protocol state"
        lead="Each anchor is an NFT-marked UTxO that holds a piece of live protocol state on L1. It is never destroyed — only consumed and re-created by validators during normal operation."
      >
        <div className={styles.anchorsGrid}>
          {STATE_ANCHORS.map((a, i) => (
            <Reveal key={a.name} delay={i * 40}>
              <div className={styles.anchorCard}>
                <div className={styles.anchorHead}>
                  <span className={styles.anchorName}>{a.name}</span>
                  <span className={styles.anchorRole}>{a.role}</span>
                </div>
                <CopyField
                  value={a.utxo}
                  href={explorerTx(a.utxo)}
                  label={`${a.name} UTxO`}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 04 — Reference scripts */}
      <Section
        id="refs"
        eyebrow="04 · Reference scripts"
        title="Deployed once, referenced everywhere"
        lead="Each validator was deployed once as an on-chain reference script, so transactions can point to it instead of carrying the script every time."
        glow="gold"
      >
        <div className={styles.refList}>
          {REFERENCE_SCRIPTS.map((r, i) => (
            <Reveal key={r.name} delay={i * 30} style={{ display: "block" }}>
              <div className={styles.refRow}>
                <span className={styles.refName}>{r.name}</span>
                <CopyField value={r.hash} label={`${r.name} script hash`} />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 05 — Genesis timeline */}
      <Section
        id="history"
        eyebrow="05 · Protocol initialization"
        title="Genesis deployment timeline"
        lead={`From the genesis transaction to the first confirmed state in about ${CONTRACTS_META.genesisToConfirmed}. Every step below is a real preprod transaction.`}
      >
        <div className={styles.timeline}>
          {GENESIS_TIMELINE.map((e, i) => (
            <Reveal
              key={e.tx + e.time}
              delay={i * 40}
              style={{ display: "block" }}
            >
              <div
                className={`${styles.tItem}${e.genesis ? ` ${styles.tItemGenesis}` : ""}`}
              >
                <div className={styles.tHead}>
                  <span className={styles.tTime}>{e.time}</span>
                  <span className={styles.tAction}>{e.action}</span>
                  {e.genesis ? (
                    <span className={`${styles.tBadge} ${styles.tBadgeGenesis}`}>
                      Genesis
                    </span>
                  ) : null}
                  {e.note ? (
                    <span className={`${styles.tBadge} ${styles.tNote}`}>
                      {e.note}
                    </span>
                  ) : null}
                </div>
                <div className={styles.tTx}>
                  <CopyField
                    value={e.tx}
                    href={explorerTx(e.tx)}
                    label="transaction"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 06 — Security model (moved here from the former /security page —
          the contracts and the model that keeps them honest live together) */}
      <Section
        id="security-model"
        eyebrow="06 · Security model"
        title="Secured by Cardano. Provable by anyone"
        lead="Midgard is designed to anchor Layer 2 state transitions to Cardano and use Cardano smart contracts for verification: operators commit blocks to the addresses above, anyone can challenge an invalid block during the challenge window, and Cardano contracts settle the result."
        glow="gold"
      >
        <Layers
          items={[
            {
              n: "01",
              name: "Finality",
              desc: "Midgard separates fast soft confirmation from later L1-anchored settlement after the challenge or maturity period.",
            },
            {
              n: "02",
              name: "Censorship resistance",
              desc: "Cardano deadlines and challenge paths enforce ordering and inclusion rules.",
            },
            {
              n: "03",
              name: "Liveness",
              desc: "If an operator stalls, Cardano-enforced escape paths let users exit and the network recover.",
            },
            {
              n: "04",
              name: "L1 anchoring",
              desc: "State transitions are designed to route through Cardano L1 verification and settlement surfaces.",
            },
          ]}
        />
        <Actions
          items={[
            {
              label: "Watch the challenge window in motion",
              href: "/how-it-works",
              variant: "ghost",
            },
          ]}
        />
      </Section>

      {/* Query it yourself */}
      <Section
        eyebrow="Build"
        title="Query the contracts yourself."
        lead="Point Lucid Evolution at preprod through Blockfrost and read the State Queue directly — the same address listed above."
      >
        <Reveal>
          <div className={styles.codeBlock}>
            <div className={styles.codeHead}>
              <span className={styles.codeDot} />
              read-state-queue.ts
            </div>
            <pre className={styles.code}>
              <code>
                <span className={styles.tok}>import</span>
                {" { Lucid, Blockfrost } "}
                <span className={styles.tok}>from</span>{" "}
                <span className={styles.str}>
                  &quot;@lucid-evolution/lucid&quot;
                </span>
                ;{"\n\n"}
                <span className={styles.cmt}>
                  {"// Point Lucid at Cardano preprod via Blockfrost"}
                </span>
                {"\n"}
                <span className={styles.tok}>const</span>
                {" lucid = "}
                <span className={styles.tok}>await</span>
                {" Lucid(\n  "}
                <span className={styles.tok}>new</span>
                {" Blockfrost(\n    "}
                <span className={styles.str}>
                  &quot;https://cardano-preprod.blockfrost.io/api/v0&quot;
                </span>
                {",\n    projectId,\n  ),\n  "}
                <span className={styles.str}>&quot;Preprod&quot;</span>
                {",\n);\n\n"}
                <span className={styles.cmt}>
                  {"// The State Queue holds every committed L2 block header"}
                </span>
                {"\n"}
                <span className={styles.tok}>const</span>
                {" stateQueue =\n  "}
                <span className={styles.str}>
                  &quot;addr_test1wqkh8medgake46f96ztg37etwgfpgz32zcz353f08jvw90ggse5ey&quot;
                </span>
                ;{"\n\n"}
                <span className={styles.tok}>const</span>
                {" utxos = "}
                <span className={styles.tok}>await</span>
                {" lucid.utxosAt(stateQueue);\n"}
                {"console.log(`${utxos.length} live entries in the queue`);"}
              </code>
            </pre>
          </div>
        </Reveal>
        {/* the stack, relocated from the home provenance section */}
        <Reveal delay={80}>
          <div style={{ marginTop: 28 }}>
            <StackChips />
          </div>
        </Reveal>
      </Section>

      <NextSteps
        items={[
          {
            label: "Watch a transaction travel",
            sub: "The journey these addresses anchor, step by step",
            href: "/how-it-works",
          },
          {
            label: "See the road to mainnet",
            sub: "Four phases, paced by the work, not by dates",
            href: "/roadmap",
          },
          {
            label: "Start building",
            sub: "Builder quickstart, SDK surfaces, and docs",
            href: "/get-started#builder-quickstart",
          },
        ]}
      />

      <CtaBand
        eyebrow="Verify everything"
        title="Read the source, run the node"
        lead="Every address on this page resolves on a public preprod explorer. The implementation, SDK surfaces, and node behavior live in the repository."
        actions={[
          { label: "Explore on GitHub", href: OFFICIAL_LINKS.github, variant: "primary", icon: <GitHubIcon size={15} /> },
          { label: "Get Started", href: "/get-started", variant: "ghost" },
        ]}
      />
    </main>
  );
}
