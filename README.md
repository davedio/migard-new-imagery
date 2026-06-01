# Midgard Gateway

Midgard Gateway is the public website and status surface for Midgard, a Cardano-native optimistic rollup from Anastasia Labs.

The site explains Midgard for users, builders, and partners. It should stay plain-spoken: say what is live, what is pending, what can be checked in source, and where settlement returns to Cardano L1.

## What This Repo Contains

- Next.js App Router website for the Midgard public gateway.
- Homepage, protocol explanation, security, testnet/status, docs bridge, FAQ, official links, and intake paths.
- Local design handoffs under `docs/design-handoffs/`.
- Network-status API and UI surfaces for L1/L2-facing status material.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

Run both checks before pushing a preview branch:

```bash
npm run lint
npm run build
```

## Preview Workflow

Use the safe publishing flow for website changes:

1. Work on a preview branch, not `main`.
2. Push the branch to GitHub.
3. Open a draft pull request into `main`.
4. Let Vercel create a preview deployment from the branch or PR.
5. Review the Vercel preview.
6. Merge only after Dave explicitly approves the preview.

Recommended branch pattern:

```bash
codex/<short-change-name>
```

## Claim-Safety Rules

Website copy is not the final technical source of truth. Before public amplification, check technical claims against:

- official Midgard source and docs,
- current testnet/status evidence,
- deployment and contract references,
- approved partner, token, and comparison language.

Prefer precise language such as `settles through Cardano L1` or `anchored to Cardano L1` unless stronger wording has been approved. Avoid broad guarantees, unverified partner claims, and token promises.

## Status Labels

Use status language consistently:

- `Pre-alpha testnet`
- `Demo`
- `Simulated`
- `Pending`
- `Roadmap`
- `Approval-dependent`

Do not present simulated L2 activity as live protocol data.

## Official Links

Canonical links are maintained in `src/lib/officialLinks.ts` and rendered on `/official-links`.

## Vercel

Vercel preview deployments should be created from non-production branches or draft PRs. Production deployment happens only through the approved merge/promotion path.
