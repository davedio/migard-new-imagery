export type EcosystemPartner = {
  name: string;
  logo: string;
  logoLight?: string;
  width: number;
  height: number;
  tone: "dark" | "light";
};

export const ECOSYSTEM_PARTNERS: readonly EcosystemPartner[] = [
  {
    name: "Liqwid",
    logo: "/ecosystem/liqwid.svg",
    logoLight: "/ecosystem/liqwid-light.svg",
    width: 190,
    height: 60,
    tone: "dark",
  },
  {
    name: "Sundae Labs",
    logo: "/ecosystem/sundae-labs-dark.png",
    logoLight: "/ecosystem/sundae-labs.png",
    width: 210,
    height: 36,
    tone: "dark",
  },
  {
    name: "Input Output",
    logo: "/ecosystem/input-output.svg",
    logoLight: "/ecosystem/input-output-light.svg",
    width: 210,
    height: 27,
    tone: "dark",
  },
  {
    name: "Lace",
    logo: "/ecosystem/lace-wordmark.svg",
    logoLight: "/ecosystem/lace-wordmark-light.svg",
    width: 150,
    height: 50,
    tone: "dark",
  },
  {
    name: "Artifi Labs",
    logo: "/ecosystem/artifi-labs.svg",
    logoLight: "/ecosystem/artifi-labs-light.svg",
    width: 205,
    height: 52,
    tone: "dark",
  },
] as const;
