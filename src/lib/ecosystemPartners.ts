export type EcosystemPartner = {
  name: string;
  logo: string;
  logoLight?: string;
  width: number;
  height: number;
  tone: "dark" | "light";
  logoShape?: "wide" | "icon" | "tall";
};

export const ECOSYSTEM_PARTNERS: readonly EcosystemPartner[] = [
  {
    name: "WingRiders",
    logo: "/ecosystem/wingriders.svg",
    logoLight: "/ecosystem/wingriders-dark.svg",
    width: 1600,
    height: 309,
    tone: "dark",
    logoShape: "wide",
  },
  {
    name: "Anvil Dev Agency",
    logo: "/ecosystem/anvil-dev-agency-light.png",
    logoLight: "/ecosystem/anvil-dev-agency.png",
    width: 921,
    height: 1036,
    tone: "dark",
    logoShape: "tall",
  },
  {
    name: "Tweag",
    logo: "/ecosystem/tweag.png",
    logoLight: "/ecosystem/tweag.png",
    width: 2110,
    height: 570,
    tone: "dark",
    logoShape: "wide",
  },
  {
    name: "Modus Create",
    logo: "/ecosystem/modus-create.svg",
    logoLight: "/ecosystem/modus-create.svg",
    width: 186,
    height: 24,
    tone: "light",
    logoShape: "wide",
  },
  {
    name: "Minswap",
    logo: "/ecosystem/minswap.png",
    logoLight: "/ecosystem/minswap-dark.png",
    width: 96,
    height: 96,
    tone: "light",
    logoShape: "icon",
  },
  {
    name: "Liqwid",
    logo: "/ecosystem/liqwid.svg",
    logoLight: "/ecosystem/liqwid-light.svg",
    width: 2652,
    height: 841,
    tone: "dark",
    logoShape: "wide",
  },
  {
    name: "USDCx",
    logo: "/ecosystem/usdcx.png",
    logoLight: "/ecosystem/usdcx.png",
    width: 330,
    height: 331,
    tone: "light",
    logoShape: "icon",
  },
  {
    name: "Midgard",
    logo: "/midgard-logo.png",
    logoLight: "/midgard-logo.png",
    width: 1092,
    height: 251,
    tone: "dark",
    logoShape: "wide",
  },
  {
    name: "Anastasia Labs",
    logo: "/ecosystem/anastasia-labs.svg",
    logoLight: "/ecosystem/anastasia-labs.svg",
    width: 2000,
    height: 464,
    tone: "light",
    logoShape: "wide",
  },
] as const;
