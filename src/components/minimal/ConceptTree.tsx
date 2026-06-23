import { SITE_COPY } from "@/lib/siteCopy";

const FLOW_GROUPS = [
  {
    n: "01",
    label: "Fast confirmation",
    detail: "Submit -> sequence -> commit",
  },
  {
    n: "02",
    label: "Verification",
    detail: "Data stays checkable -> Watcher replay",
  },
  {
    n: "03",
    label: "L1 settlement",
    detail: "Verified state settles",
  },
] as const;

const CALLOUTS = [
  {
    title: "Fast action",
    body: "submit -> commit",
    x: 78,
    y: 76,
  },
  {
    title: "Public checks",
    body: "replay -> challenge",
    x: 356,
    y: 184,
  },
  {
    title: "Final settlement",
    body: "verified state",
    x: 574,
    y: 366,
  },
] as const;

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
        <path className="minimal-tree__proof-loop" d="M468 270 C558 212 648 274 548 368 C488 424 412 360 468 270" />
        <path className="minimal-tree__root" d="M360 462 C312 438 258 438 204 468" />
        <path className="minimal-tree__root" d="M360 462 C428 426 508 436 606 480" />
        <path className="minimal-tree__root" d="M360 462 C354 418 362 382 394 342" />

        <g filter="url(#minimal-tree-glow)">
          <circle className="minimal-tree__packet packet-a" r="9">
            <animateMotion dur="7s" repeatCount="indefinite">
              <mpath href="#minimal-packet-path" />
            </animateMotion>
          </circle>
          <circle className="minimal-tree__packet packet-b" r="7">
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
        {CALLOUTS.map((callout) => (
          <g className="minimal-tree__callout" key={callout.title} transform={`translate(${callout.x} ${callout.y})`}>
            <rect width="126" height="48" rx="7" />
            <text x="13" y="20">{callout.title}</text>
            <text x="13" y="36" className="detail">{callout.body}</text>
          </g>
        ))}
      </svg>
      <ol className="minimal-tree__stage-list" aria-label="Midgard transaction phases">
        {FLOW_GROUPS.map((group) => (
          <li key={group.label}>
            <span>{group.n}</span>
            <div>
              <strong>{group.label}</strong>
              <small>{group.detail}</small>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
