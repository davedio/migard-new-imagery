import { ContractTopology } from "@/components/site/ContractTopology";
import { CopyField } from "@/components/site/CopyField";
import { Prose, Section } from "@/components/site/ui";
import {
  CONTRACTS,
  CONTRACTS_META,
  GENESIS_TIMELINE,
  REFERENCE_SCRIPTS,
  STATE_ANCHORS,
  explorerAddress,
  explorerTx,
} from "@/lib/contracts";
import styles from "@/components/site/contracts.module.css";

/* Contracts reference — a block of /developers, not a page of its own
   (reading-rhythm redesign): a normal Section header band (no second hero,
   no second sticky toc), the topology set-piece, then one continuous table
   of record (validators + script hashes, state anchors, genesis history)
   and the runnable query snippet. Rows and prose are static; the topology
   draw-in is the page's set-piece. */

const SCRIPT_HASH_BY_NAME = new Map(REFERENCE_SCRIPTS.map((s) => [s.name, s.hash]));

export function ContractsReference() {
  return (
    <div className={`contracts-page ${styles.contractsPage}`}>
      <Section
        id="contracts"
        eyebrow="Contracts"
        title="Inspect the contract path."
        lead="Verify Midgard preprod contract addresses, inspect state anchors, and trace bootstrap history."
      >
        <Prose
          items={[
            {
              text: "User activity enters through the Deposit, Tx Order, and Withdrawal validators; Hub Oracle, Scheduler, State Queue, and Settlement coordinate the state that can mature; and the fault-proof contracts give Watchers a public route to contest invalid committed state before it settles.",
            },
          ]}
        />
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
        <p className={styles.queryTeaser}>
          <a href="#query">Prefer to check it in code? Skip to the runnable query →</a>
        </p>
      </Section>

      <Section
        id="contracts-topology"
        title="The protocol surface."
        lead="Hover a node to trace its related contracts — green edges are Hub Oracle references, gold is the fault-proof path — then use the directory below for addresses, anchors, and bootstrap transactions."
      >
        <ContractTopology />
      </Section>

      <Section
        id="contracts-addresses"
        title="Core validators."
        lead="Each validator is deployed once as an on-chain reference script. Open a preprod address on the explorer, or copy the address and script hash for your own tooling."
        glow="green"
      >
        <div className={styles.directory}>
          {CONTRACTS.map((contract) => {
            const scriptHash = SCRIPT_HASH_BY_NAME.get(contract.name);
            return (
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
                {scriptHash ? (
                  <div className={styles.addrLine}>
                    <span className={styles.addrLabel}>script</span>
                    <CopyField value={scriptHash} label={`${contract.name} reference script hash`} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        id="contracts-anchors"
        title="State anchors."
        lead="Each anchor is an NFT-marked UTxO that records protocol state in this snapshot."
      >
        <div className={styles.refList}>
          {STATE_ANCHORS.map((anchor) => (
            <div className={styles.refRow} key={anchor.name}>
              <span className={styles.refName}>{anchor.name}</span>
              <span className={styles.refRole}>{anchor.role}</span>
              <CopyField value={anchor.utxo} href={explorerTx(anchor.utxo)} label={`${anchor.name} UTxO`} />
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="contracts-history"
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
    </div>
  );
}
