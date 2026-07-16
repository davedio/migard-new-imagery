import type { ReactNode } from "react";
import { DiscordIcon, GitHubIcon, XIcon } from "@/components/site/BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

type OfficialSocial = {
  id: "github" | "x" | "discord";
  label: string;
  action: string;
  href: string;
  icon: (size: number) => ReactNode;
};

export const OFFICIAL_SOCIAL_LINKS: readonly OfficialSocial[] = [
  {
    id: "github",
    label: "GitHub",
    action: "Open GitHub",
    href: OFFICIAL_LINKS.github,
    icon: (size) => <GitHubIcon size={size} aria-hidden />,
  },
  {
    id: "x",
    label: "X",
    action: "Follow on X",
    href: OFFICIAL_LINKS.x,
    icon: (size) => <XIcon size={size} aria-hidden />,
  },
  {
    id: "discord",
    label: "Discord",
    action: "Join Discord",
    href: OFFICIAL_LINKS.discord,
    icon: (size) => <DiscordIcon size={size} aria-hidden />,
  },
] as const;

export function OfficialChannelIcon({
  label,
  size = 18,
}: {
  label: string;
  size?: number;
}) {
  const normalized = label.toLowerCase();

  if (normalized.includes("github")) {
    return <GitHubIcon size={size} aria-hidden />;
  }

  if (normalized === "x" || normalized.includes("twitter")) {
    return <XIcon size={size} aria-hidden />;
  }

  if (normalized.includes("discord")) {
    return <DiscordIcon size={size} aria-hidden />;
  }

  return null;
}

export function OfficialSocialLinks({
  className = "official-socials",
  linkClassName = "official-socials__link",
  iconSize = 16,
  showLabels = false,
  onNavigate,
}: {
  className?: string;
  linkClassName?: string;
  iconSize?: number;
  showLabels?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className={className} role="group" aria-label="Official channels">
      {OFFICIAL_SOCIAL_LINKS.map((item) => (
        <a
          key={item.id}
          className={linkClassName}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${item.action} (opens in a new tab)`}
          title={item.label}
          onClick={onNavigate}
        >
          {item.icon(iconSize)}
          {showLabels ? <span>{item.label}</span> : null}
        </a>
      ))}
    </div>
  );
}
