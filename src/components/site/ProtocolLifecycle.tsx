"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
type Flow = "l2-to-l1" | "l1-to-l2" | "both" | null;

type Step = {
  number: string;
  stage: string;
  title: string;
  annotation: string;
  Icon: ComponentType<IconProps>;
  l2: string;
  l1: string | null;
  flow: Flow;
};

const STEPS: Step[] = [
  {
    number: "01",
    stage: "SUBMIT",
    title: "Transact on Midgard",
    annotation: "Off-chain · L2",
    Icon: ZapIcon,
    l2: "The Midgard node validates activity against eUTXO rules and issues a soft confirmation without waiting for an L1 block at this step.",
    l1: null,
    flow: null,
  },
  {
    number: "02",
    stage: "SEQUENCE",
    title: "Sequence & Batch",
    annotation: "L2 Operator",
    Icon: LayersIcon,
    l2: "The active operator orders transactions and assembles a block using the same eUTXO model as Cardano L1.",
    l1: null,
    flow: null,
  },
  {
    number: "03",
    stage: "COMMIT",
    title: "Settle to Cardano L1",
    annotation: "L1 State Queue",
    Icon: UploadIcon,
    l2: "The block is assembled, signed, and prepared for the Cardano anchor.",
    l1: "The header is stored in the on-chain state queue, with operator bond locked against fraud.",
    flow: "l2-to-l1",
  },
  {
    number: "04",
    stage: "WATCH",
    title: "Watch for Fraud",
    annotation: "Challenge Window",
    Icon: ShieldIcon,
    l2: "Watchers replay each transaction with public block data and check the validity against Cardano.",
    l1: "A valid fraud proof can slash the operator bond and revert the disputed block.",
    flow: "both",
  },
  {
    number: "05",
    stage: "SETTLE",
    title: "Final Settlement",
    annotation: "L1 Confirmed",
    Icon: CheckIcon,
    l2: "No fraud is detected. Soft finality becomes permanent application history.",
    l1: "The maturity period ends. The block is merged into confirmed state and becomes as final on Cardano.",
    flow: "l1-to-l2",
  },
];

function Svg({
  size = 15,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

function ZapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </Svg>
  );
}

function LayersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 3 9 4-9 4-9-4 9-4Z" />
      <path d="m3 12 9 4 9-4" />
      <path d="m3 17 9 4 9-4" />
    </Svg>
  );
}

function UploadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 21h14" />
    </Svg>
  );
}

function ShieldIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1v7Z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </Svg>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

function FlowIcon({ flow, active }: { flow: Flow; active: boolean }) {
  if (!flow) return null;
  const label = flow === "l2-to-l1" ? "→" : flow === "l1-to-l2" ? "←" : "↔";
  return (
    <span className="lifecycle-card__flow" data-active={active}>
      {label}
    </span>
  );
}

function LifecycleRail({ activeStep }: { activeStep: number }) {
  const firstY = 26;
  const stepGap = 50;
  const height = firstY + (STEPS.length - 1) * stepGap + 20;
  const firstL1 = STEPS.findIndex((step) => step.l1 !== null);

  return (
    <svg
      className="lifecycle-rail"
      viewBox={`0 0 100 ${height}`}
      width="100"
      height={height}
      aria-hidden
    >
      <text x="30" y="12" textAnchor="middle">
        L2
      </text>
      <text x="70" y="12" textAnchor="middle" className="is-muted">
        L1
      </text>
      <line
        x1="30"
        y1={firstY}
        x2="30"
        y2={firstY + activeStep * stepGap}
        className="is-live"
      />
      <line
        x1="30"
        y1={firstY + activeStep * stepGap}
        x2="30"
        y2={firstY + (STEPS.length - 1) * stepGap}
        className="is-idle"
      />
      <line
        x1="70"
        y1={firstY + firstL1 * stepGap}
        x2="70"
        y2={firstY + Math.max(activeStep, firstL1) * stepGap}
        className="is-l1-live"
        style={{ opacity: activeStep > firstL1 ? 1 : 0 }}
      />
      <line
        x1="70"
        y1={firstY + Math.max(activeStep, firstL1) * stepGap}
        x2="70"
        y2={firstY + (STEPS.length - 1) * stepGap}
        className="is-idle"
      />
      {STEPS.map((step, index) => {
        const y = firstY + index * stepGap;
        const active = index === activeStep;
        const complete = index < activeStep;
        return (
          <g key={step.stage}>
            <text
              x="14"
              y={y + 2.5}
              textAnchor="middle"
              className={active ? "is-active" : complete ? "is-complete" : ""}
            >
              {step.number}
            </text>
            <circle
              cx="30"
              cy={y}
              r="9"
              className="lifecycle-rail__halo"
              style={{ opacity: active ? 1 : 0 }}
            />
            <circle
              cx="30"
              cy={y}
              r="4"
              className={active ? "is-active" : complete ? "is-complete" : ""}
            />
            {step.flow ? (
              <>
                <line
                  x1="34"
                  y1={y}
                  x2="66"
                  y2={y}
                  strokeDasharray={step.flow === "both" ? "3 2" : undefined}
                  className={
                    active ? "is-active-flow" : complete ? "is-complete-flow" : ""
                  }
                />
                <text
                  x="50"
                  y={y - 3}
                  textAnchor="middle"
                  className="lifecycle-rail__arrow"
                  style={{ opacity: active ? 1 : 0 }}
                >
                  {step.flow === "l2-to-l1"
                    ? "→"
                    : step.flow === "l1-to-l2"
                      ? "←"
                      : "↔"}
                </text>
                <circle
                  cx="70"
                  cy={y}
                  r="9"
                  className="lifecycle-rail__l1-halo"
                  style={{ opacity: active ? 1 : 0 }}
                />
                <circle
                  cx="70"
                  cy={y}
                  r="4"
                  className={active ? "is-l1-active" : complete ? "is-l1-complete" : ""}
                />
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function StepCard({
  step,
  index,
  active,
  register,
}: {
  step: Step;
  index: number;
  active: boolean;
  register: (index: number, node: HTMLLIElement | null) => void;
}) {
  const Icon = step.Icon;

  return (
    <li
      ref={(node) => register(index, node)}
      data-step={index}
      className="lifecycle-card"
      data-active={active}
    >
      <div className="lifecycle-card__head">
        <div className="lifecycle-card__title">
          <span className="lifecycle-card__icon" data-active={active}>
            <Icon size={14} />
            <span>{index + 1}</span>
          </span>
          <h3>{step.title}</h3>
        </div>
        <span className="lifecycle-card__annotation">{step.annotation}</span>
      </div>
      <div className="lifecycle-card__body">
        <div className="lifecycle-card__side">
          <div className="lifecycle-card__network" data-active={active}>
            <span />
            Midgard L2
          </div>
          <p>{step.l2}</p>
        </div>
        <div className="lifecycle-card__bridge" data-empty={!step.flow}>
          <FlowIcon flow={step.flow} active={active} />
        </div>
        <div className="lifecycle-card__side" data-muted={!step.l1}>
          <div className="lifecycle-card__network">
            <span />
            Cardano L1
          </div>
          <p>{step.l1 ?? "No on-chain interaction at this stage."}</p>
        </div>
      </div>
    </li>
  );
}

export default function ProtocolLifecycle() {
  const [activeStep, setActiveStep] = useState(0);
  const activeRef = useRef(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    let frame: number | null = null;
    const update = () => {
      const threshold = window.innerHeight * 0.44;
      let next = 0;
      itemRefs.current.forEach((node, index) => {
        if (node && node.getBoundingClientRect().top < threshold) {
          next = index;
        }
      });
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActiveStep(next);
      }
    };
    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        update();
        frame = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const register = (index: number, node: HTMLLIElement | null) => {
    itemRefs.current[index] = node;
  };

  return (
    <section className="lifecycle" id="lifecycle">
      <div className="lifecycle__inner">
        <aside className="lifecycle__rail" aria-hidden>
          <div className="lifecycle__stage-labels">
            {STEPS.map((step, index) => (
              <p
                key={step.stage}
                style={{ opacity: index === activeStep ? 1 : 0 }}
              >
                [{step.number} / 05]
                <br />
                STAGE_{step.stage}
              </p>
            ))}
          </div>
          <LifecycleRail activeStep={activeStep} />
        </aside>
        <div className="lifecycle__main">
          <header className="lifecycle__hero">
            <div className="eyebrow">How it works</div>
            <h1>One trust path, end to end.</h1>
            <p>
              Midgard runs as a Cardano-native optimistic rollup: submit,
              sequence, commit, watch, and settle back to Cardano.
            </p>
          </header>
          <ol className="lifecycle__steps" aria-label="Protocol lifecycle steps">
            {STEPS.map((step, index) => (
              <StepCard
                key={step.stage}
                step={step}
                index={index}
                active={index === activeStep}
                register={register}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
