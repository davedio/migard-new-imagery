/* =========================================================================
   Midgard contract surface — preprod deployment data.

   This is a STATIC snapshot of the public Cardano preprod deployment
   (genesis 25 Apr 2026). It is sourced from on-chain transactions and is
   verifiable on a preprod explorer via the helpers below. Live querying
   (Blockfrost) is planned; until then the page must label this as a static
   snapshot, never as a live feed. See README claim-safety rules.
   ========================================================================= */

export const CONTRACTS_META = {
  network: "Cardano preprod",
  era: "Conway",
  /** Labelled static on the page — not polled live yet. */
  epoch: "~174",
  genesisDate: "25 Apr 2026",
  /** Time from genesis tx to first confirmed state, from the timeline below. */
  genesisToConfirmed: "17 minutes",
  explorer: "https://preprod.cexplorer.io",
} as const;

export function explorerAddress(addr: string): string {
  return `${CONTRACTS_META.explorer}/address/${addr}`;
}

export function explorerTx(txHash: string): string {
  // UTxO refs (hash#index) resolve by their transaction hash.
  return `${CONTRACTS_META.explorer}/tx/${txHash.split("#")[0]}`;
}

/** Shorten a long hash/address for display: head…tail. */
export function truncMiddle(value: string, head = 10, tail = 8): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export type Accent = "green" | "gold";

export type Contract = {
  name: string;
  tag: string;
  /** core sequencing path = green; value movement + settlement = gold. */
  accent: Accent;
  address: string;
  desc: string;
};

/** The seven core validators with live preprod script addresses. */
export const CONTRACTS: readonly Contract[] = [
  {
    name: "Hub Oracle",
    tag: "Registry",
    accent: "green",
    address:
      "addr_test1wp7quas6038mjh5nrhsvt29z9ag0vrat0nmuvrqwz88x9rg4qpcnu",
    desc: "Central protocol registry. Tracks active operators, genesis parameters, and the current protocol version.",
  },
  {
    name: "State Queue",
    tag: "Core",
    accent: "green",
    address:
      "addr_test1wqkh8medgake46f96ztg37etwgfpgz32zcz353f08jvw90ggse5ey",
    desc: "Singly-linked queue of committed L2 blocks. New blocks append to the tail; the oldest block folds into confirmed state first.",
  },
  {
    name: "Scheduler",
    tag: "Scheduling",
    accent: "green",
    address:
      "addr_test1wr7r59z05hdsamz97tlzdmhn3qqn4mwj5ldvesm8tzv6svqlpwnsg",
    desc: "Manages operator shift assignments and advances the active slot window to coordinate block production.",
  },
  {
    name: "Deposit",
    tag: "Bridge",
    accent: "gold",
    address:
      "addr_test1wpuzy7pa0a2n5fddn5vuzua07nha28pug9l2w8l9v3vlxsg8mw2hg",
    desc: "Handles Cardano L1 → L2 deposits. Funds remain locked on Cardano L1 until the deposit is confirmed in the state queue.",
  },
  {
    name: "Withdrawal",
    tag: "Bridge",
    accent: "gold",
    address:
      "addr_test1wrfvqj3tn2fzx56hkv5en53ypq6m4y2qkp4wv2wqwtdjcxq24ey8j",
    desc: "Processes L2 → Cardano L1 exits after the associated block passes the fault-proof window.",
  },
  {
    name: "Tx Order",
    tag: "Ordering",
    accent: "gold",
    address:
      "addr_test1wryh5c33n27qu9nu4smrd9a3qklm0kxnkjnhz9z7d2wx9xsxrwz0g",
    desc: "Enforces deterministic transaction ordering within each committed block before it is merged.",
  },
  {
    name: "Settlement",
    tag: "Settlement",
    accent: "gold",
    address:
      "addr_test1wquqs7cl5zajrura775a50zzwyuglqy95et3a6c8ajsz7xc2rdhyg",
    desc: "Finalizes Cardano L1 fund distribution when a merged block carries non-empty transaction, deposit, or withdrawal commitments.",
  },
];

export type StateAnchor = {
  name: string;
  role: string;
  utxo: string;
};

/** NFT-anchored UTxOs that hold live protocol state on L1. */
export const STATE_ANCHORS: readonly StateAnchor[] = [
  {
    name: "Hub Oracle",
    role: "protocol genesis",
    utxo: "47d17f1b0f93b61bdfccbe6623166ed6132077d7222f7afcb9144c70048be41a#0",
  },
  {
    name: "Scheduler",
    role: "operator shifts",
    utxo: "6ee17438b106aedfb022bea28e7a7d563295205e9ea545521aa6abccd64b5a25#0",
  },
  {
    name: "Confirmed State",
    role: "current L2 state",
    utxo: "5ed6cfefadce4de06974217dc70719df752dd445eedd58f6a4e9580cb7d4d7c7#0",
  },
  {
    name: "Registered Operators",
    role: "registration tree",
    utxo: "a83e282e09bf61019baa330ed7a63d37d4272281ccfcec864111f9879022197a#2",
  },
  {
    name: "Active Operators",
    role: "active set",
    utxo: "a83e282e09bf61019baa330ed7a63d37d4272281ccfcec864111f9879022197a#1",
  },
  {
    name: "Retired Operators",
    role: "retired set",
    utxo: "47d17f1b0f93b61bdfccbe6623166ed6132077d7222f7afcb9144c70048be41a#5",
  },
];

export type ReferenceScript = {
  name: string;
  hash: string;
};

/** Each validator deployed once as an on-chain reference script UTxO. */
export const REFERENCE_SCRIPTS: readonly ReferenceScript[] = [
  { name: "Hub Oracle", hash: "e02eaaf52eadb1eb1b4d1260c106b3e3f94169349f6e1ac0f9f363b7b0cdc215" },
  { name: "State Queue", hash: "9bc2d511e22d5b587d6ccc6886b34db3f5acffec6aecf9217fed629ea373e21c" },
  { name: "Scheduler", hash: "59f86d8f3d22a14c8db01e0f0887908acb2767cf31419974060b2cf71566ba2a" },
  { name: "Deposit", hash: "aa9f7c242c552cc4a486da260620129adb36e649eaf0723a38820a8861ce28be" },
  { name: "Withdrawal", hash: "e16308dfde97492282eb070d8b8cb4c9b889162207c25754065f6c1f60c36a06" },
  { name: "Tx Order", hash: "d1f6b718bea9ef993b7601d286203f7b602ce22f1d19cd3cbc77b40ebff95413" },
];

export type TimelineEvent = {
  action: string;
  tx: string;
  time: string;
  genesis: boolean;
  note?: string;
};

/** Bootstrap sequence: genesis → first confirmed state, all on preprod. */
export const GENESIS_TIMELINE: readonly TimelineEvent[] = [
  { action: "Protocol init / state deployment", tx: "47d17f1b0f93b61bdfccbe6623166ed6132077d7222f7afcb9144c70048be41a", time: "17:27Z", genesis: true },
  { action: "Operator registration", tx: "288e1a15e1145a91d35ba3729c0f5c7c73cd5535061830632ef2c30c2b5769ea", time: "17:30Z", genesis: false },
  { action: "Operator activation", tx: "a83e282e09bf61019baa330ed7a63d37d4272281ccfcec864111f9879022197a", time: "17:32Z", genesis: false },
  { action: "Deposit", tx: "637291210692b6b00edf9f09acf11a8fdd25c75eca4115c0f0ec718676c5528a", time: "17:35Z", genesis: false },
  { action: "Scheduler advancement", tx: "6ee17438b106aedfb022bea28e7a7d563295205e9ea545521aa6abccd64b5a25", time: "17:37Z", genesis: false },
  { action: "State commitment", tx: "fa51a5ac0e28776d0cde3aa9c57f345346e385531bc7fd0fff991e799032e845", time: "17:38Z", genesis: false, note: "1st block" },
  { action: "State commitment", tx: "0c5e43e57b472493b54bfe2dfcf4a424ceeb0ca38a82342ef8f83504b54c733b", time: "17:40Z", genesis: false, note: "2nd block" },
  { action: "State commitment merge", tx: "22e6b1e0a1f19c064f67b0b6ce1af03293bc488bf653b7f255feaf38752df810", time: "17:43Z", genesis: false },
  { action: "State commitment merge", tx: "5ed6cfefadce4de06974217dc70719df752dd445eedd58f6a4e9580cb7d4d7c7", time: "17:44Z", genesis: false },
];
