import { SITE_URL } from "@/lib/siteConfig";

export const OFFICIAL_LINKS = {
  website: SITE_URL,
  docs: "https://github.com/Anastasia-Labs/midgard",
  github: "https://github.com/Anastasia-Labs/midgard",
  /* technicalSpec removed 2026-07-24 (Dave): the whitepaper must NOT be
     linked from the site — every surface says "Coming soon" instead. Do
     not re-add a spec/whitepaper link without his explicit say-so. */
  x: "https://x.com/midgardprotocol",
  /* Discord removed from the official channels 2026-07-24 (Dave) — do not
     re-add a server link anywhere without his explicit say-so. */
  intakeForm:
    "https://docs.google.com/forms/d/e/1FAIpQLSfqXeRid4e2k_ZkMPf1t-UJYb9xi0nuc9q0jm77Bm8LdDdxAg/viewform",
  /** Responsible-disclosure route on the public Midgard site. */
  securityPolicy: "/security-policy",
  blaster: "https://www.iog.io/news/automated-formal-verification-for-cardano-smart-contracts",
  /** Legacy Anastasia Labs URL retained for approved partner/background links. */
  anastasiaLabs: "https://anastasialabs.com",
} as const;
