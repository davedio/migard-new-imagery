import type { SVGProps } from "react";

/* Recognizable brand glyphs (inline SVG, currentColor) for official channels.
   Single source so the footer, official-links table, and CTAs stay consistent. */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function GitHubIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.34-1.74-1.34-1.74-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.49.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.21.96-.26 1.98-.39 3-.4 1.02.01 2.04.14 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.66 1.64.24 2.86.12 3.16.77.83 1.24 1.88 1.24 3.17 0 4.53-2.81 5.53-5.49 5.82.43.36.81 1.09.81 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.22.68.83.56C20.56 21.91 24 17.5 24 12.29 24 5.78 18.63.5 12 .5z" />
    </svg>
  );
}

export function XIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

export function DiscordIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.21.375-.444.88-.608 1.28a18.27 18.27 0 0 0-5.487 0A12.6 12.6 0 0 0 9.18 3a19.74 19.74 0 0 0-4.435 1.37C1.93 8.59 1.16 12.71 1.54 16.77a19.93 19.93 0 0 0 6.06 3.06c.49-.67.93-1.38 1.3-2.13-.71-.27-1.39-.6-2.03-.99.17-.12.34-.25.5-.38a14.23 14.23 0 0 0 12.18 0c.16.13.33.26.5.38-.64.39-1.32.72-2.03.99.37.75.81 1.46 1.3 2.13a19.9 19.9 0 0 0 6.06-3.06c.45-4.69-.77-8.78-3.2-12.4zM8.02 14.33c-1.18 0-2.15-1.09-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.15 2.42 0 1.33-.95 2.42-2.15 2.42zm7.96 0c-1.18 0-2.15-1.09-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.15 2.42 0 1.33-.94 2.42-2.15 2.42z" />
    </svg>
  );
}
