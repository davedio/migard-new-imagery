import { SITE_COPY } from "@/lib/siteCopy";

export function ConceptTree() {
  return (
    <div className="minimal-tree" aria-label="Midgard transaction flow">
      <svg viewBox="0 0 760 520" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="minimal-tree-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(78,243,131,0.9)" />
            <stop offset="0.48" stopColor="rgba(78,243,131,0.55)" />
            <stop offset="1" stopColor="rgba(207,154,46,0.85)" />
          </linearGradient>
          <filter id="minimal-tree-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <path
            id="minimal-packet-path"
            d="M108 124 C214 88 264 142 334 176 C432 222 484 274 540 360 C574 412 620 438 676 458"
          />
        </defs>

        <path className="minimal-tree__limb faint" d="M382 88 C346 182 340 278 360 462" />
        <path className="minimal-tree__limb faint" d="M382 104 C294 148 222 214 164 306" />
        <path className="minimal-tree__limb faint" d="M388 112 C494 152 580 220 656 318" />
        <path className="minimal-tree__limb" d="M104 124 C220 86 280 148 360 190 C462 242 516 320 676 458" />
        <path className="minimal-tree__root" d="M360 462 C312 438 258 438 204 468" />
        <path className="minimal-tree__root" d="M360 462 C428 426 508 436 606 480" />
        <path className="minimal-tree__root" d="M360 462 C354 418 362 382 394 342" />

        <g filter="url(#minimal-tree-glow)">
          <circle className="minimal-tree__packet packet-a" r="7">
            <animateMotion dur="7s" repeatCount="indefinite">
              <mpath href="#minimal-packet-path" />
            </animateMotion>
          </circle>
          <circle className="minimal-tree__packet packet-b" r="5">
            <animateMotion dur="7s" begin="-2.4s" repeatCount="indefinite">
              <mpath href="#minimal-packet-path" />
            </animateMotion>
          </circle>
        </g>

        {SITE_COPY.lifecycle.map(([label], i) => {
          const points = [
            [98, 124],
            [228, 114],
            [348, 182],
            [468, 270],
            [548, 368],
            [678, 458],
          ] as const;
          const [x, y] = points[i];
          return (
            <g className="minimal-tree__node" key={label} transform={`translate(${x} ${y})`}>
              <circle r="15" />
              <text y="4">{String(i + 1).padStart(2, "0")}</text>
            </g>
          );
        })}
      </svg>
      <ol className="minimal-tree__stage-list" aria-label="Transaction stages">
        {SITE_COPY.lifecycle.map(([label], i) => (
          <li key={label}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}
