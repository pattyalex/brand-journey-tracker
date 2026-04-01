import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Joyride, { CallBackProps, EVENTS, STATUS, Step, TooltipRenderProps } from "react-joyride";

interface PlannerTourProps {
  run: boolean;
  onComplete: () => void;
  onStepChange?: (index: number) => void;
}

const TOTAL_STEPS = 3;

// Progress dots (same style as ContentHubTour)
const TourProgressDots: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="flex gap-1.5">
    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
      <div
        key={i}
        className="w-[6px] h-[6px] rounded-full transition-colors duration-200"
        style={
          i <= currentStep
            ? { backgroundColor: "#612A4F" }
            : { backgroundColor: "transparent", border: "1.5px solid #C4B5C9" }
        }
      />
    ))}
  </div>
);

// Custom tooltip — hidden, we use portals instead
const TourTooltip: React.FC<TooltipRenderProps> = ({ tooltipProps }) => {
  return <div {...tooltipProps} style={{ display: "none" }} />;
};

const TARGETS = [
  '[data-tour="planner-pill-tasks"]',
  '[data-tour="planner-pill-content"]',
  '[data-tour="planner-pill-all"]',
];

const INACTIVE_STYLE = {
  backgroundColor: "#ffffff",
  color: "#374151",
  border: "1px solid #DDD5E0",
  boxShadow: "none",
};

const ACTIVE_STYLE = {
  backgroundColor: "#612a4f",
  color: "#ffffff",
  borderColor: "transparent",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
};

const applyStyle = (el: HTMLElement, style: Record<string, string>) => {
  Object.entries(style).forEach(([k, v]) => { (el.style as any)[k] = v; });
};

const clearStyle = (el: HTMLElement, keys: string[]) => {
  keys.forEach((k) => { (el.style as any)[k] = ""; });
};

const STYLE_KEYS = ["backgroundColor", "color", "border", "borderColor", "boxShadow"];

const PlannerTour: React.FC<PlannerTourProps> = ({ run, onComplete, onStepChange }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [pillPos, setPillPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const goToStep = (idx: number) => {
    setStepIndex(idx);
    onStepChange?.(idx);
  };

  // Track the current target pill position
  useEffect(() => {
    if (!run) return;
    const update = () => {
      const el = document.querySelector<HTMLElement>(TARGETS[stepIndex]);
      if (el) {
        const rect = el.getBoundingClientRect();
        setPillPos({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      }
    };
    requestAnimationFrame(update);
    const timer = setTimeout(update, 100);
    window.addEventListener("resize", update);
    return () => { clearTimeout(timer); window.removeEventListener("resize", update); };
  }, [run, stepIndex]);

  // Elevate current target + force pill styles per step
  useEffect(() => {
    if (!run) return;
    const el = document.querySelector<HTMLElement>(TARGETS[stepIndex]);
    if (el) {
      el.style.position = "relative";
      el.style.zIndex = "10001";
    }

    const allPill = document.querySelector<HTMLElement>('[data-tour="planner-pill-all"]');
    const tasksPill = document.querySelector<HTMLElement>('[data-tour="planner-pill-tasks"]');
    const contentPill = document.querySelector<HTMLElement>('[data-tour="planner-pill-content"]');

    if (stepIndex === 1) {
      // Content active, Tasks + All inactive
      if (contentPill) applyStyle(contentPill, ACTIVE_STYLE);
      if (tasksPill) applyStyle(tasksPill, INACTIVE_STYLE);
      if (allPill) applyStyle(allPill, INACTIVE_STYLE);
    } else if (stepIndex === 2) {
      // All active, Tasks + Content inactive
      if (allPill) applyStyle(allPill, ACTIVE_STYLE);
      if (tasksPill) applyStyle(tasksPill, INACTIVE_STYLE);
      if (contentPill) applyStyle(contentPill, INACTIVE_STYLE);
    }

    return () => {
      if (el) { el.style.position = ""; el.style.zIndex = ""; }
      if (allPill) clearStyle(allPill, STYLE_KEYS);
      if (tasksPill) clearStyle(tasksPill, STYLE_KEYS);
      if (contentPill) clearStyle(contentPill, STYLE_KEYS);
    };
  }, [run, stepIndex]);

  const [steps] = useState<Step[]>([
    {
      target: '[data-tour="planner-pill-tasks"]',
      title: "", content: (<></>),
      placement: "bottom" as const,
      disableBeacon: true,
      floaterProps: { hideArrow: true },
    },
    {
      target: '[data-tour="planner-pill-content"]',
      title: "", content: (<></>),
      placement: "bottom" as const,
      disableBeacon: true,
      floaterProps: { hideArrow: true },
    },
    {
      target: '[data-tour="planner-pill-all"]',
      title: "", content: (<></>),
      placement: "bottom" as const,
      disableBeacon: true,
      floaterProps: { hideArrow: true },
    },
  ]);

  const handleCallback = (data: CallBackProps) => {
    const { status, type, action } = data;

    if (type === EVENTS.STEP_BEFORE) {
      onStepChange?.(data.index);
    }

    if (type === EVENTS.STEP_AFTER) {
      if (action === "next") {
        goToStep(data.index + 1);
      } else if (action === "prev") {
        goToStep(data.index - 1);
      }
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setStepIndex(-1);
      onComplete();
    }
  };

  // Shared tooltip card renderer
  const renderTooltip = (
    step: number,
    title: string,
    description: string,
    pos: { top: number; left: number; width: number; height: number },
    alignRight?: boolean,
  ) =>
    createPortal(
      <div
        className="fixed"
        style={{
          zIndex: 10004,
          top: pos.top + pos.height + 16,
          ...(alignRight
            ? { right: window.innerWidth - (pos.left + pos.width), }
            : { left: pos.left + pos.width / 2, transform: "translateX(-50%)" }
          ),
        }}
      >
        <div style={{ position: "relative" }}>
          {/* Arrow pointing up */}
          <div
            style={{
              position: "absolute",
              top: -14,
              ...(alignRight
                ? { right: 30 }
                : { left: "50%", transform: "translateX(-50%)" }
              ),
              width: 28,
              height: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: "#FFFFFF",
                transform: "rotate(45deg)",
                position: "absolute",
                bottom: -10,
                left: 4,
                boxShadow: "0 8px 30px rgba(93,63,90,0.12)",
              }}
            />
          </div>
          <div
            className="rounded-2xl bg-white p-6"
            style={{
              boxShadow: "0 8px 30px rgba(93,63,90,0.12), 0 -8px 30px rgba(93,63,90,0.1)",
              border: "1px solid rgba(93,63,90,0.08)",
              maxWidth: 380,
              minWidth: 300,
            }}
          >
            <h3
              className="text-[18px] mb-2 text-[#612A4F]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
            >
              {title}
            </h3>
            <div className="text-[14px] leading-relaxed text-[#4A3D45]">
              <p>{description}</p>
            </div>
            <div className="flex items-center justify-between mt-5">
              <TourProgressDots currentStep={step} />
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={() => goToStep(step - 1)}
                    className="px-3 py-1.5 text-[13px] font-medium text-[#8B7082] hover:text-[#612A4F] transition-colors outline-none focus:outline-none"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (step === TOTAL_STEPS - 1) {
                      onComplete();
                    } else {
                      goToStep(step + 1);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] outline-none focus:outline-none"
                  style={{ backgroundColor: "#612A4F" }}
                >
                  {step === TOTAL_STEPS - 1 ? "Got it!" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      {/* Step 0 — Tasks pill */}
      {run && stepIndex === 0 && pillPos && renderTooltip(
        0,
        "Your Tasks Calendar",
        "This is your planner. Use it to manage your daily to-dos — from filming days to admin work.",
        pillPos,
      )}

      {/* Step 1 — Content pill */}
      {run && stepIndex === 1 && pillPos && renderTooltip(
        1,
        "Your Content Calendar",
        "Switch here to schedule your content — posts, reels, and videos ready to go live.",
        pillPos,
        true,
      )}

      {/* Step 2 — All pill */}
      {run && stepIndex === 2 && pillPos && renderTooltip(
        2,
        "Tasks and Content — All Together",
        "See everything in one place, so you always have the full picture of your week.",
        pillPos,
        true,
      )}

      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress={false}
        showSkipButton={false}
        scrollToFirstStep={false}
        spotlightPadding={-2}
        disableOverlayClose
        disableScrolling
        tooltipComponent={TourTooltip}
        callback={handleCallback}
        styles={{
          options: {
            primaryColor: "#612A4F",
            zIndex: 10000,
            arrowColor: "#FFFFFF",
            overlayColor: "rgba(250, 247, 245, 0.45)",
          },
          spotlight: {
            borderRadius: 50,
            backgroundColor: "transparent",
            boxShadow: "0 0 0 4px #612A4F",
            border: "none",
          },
          overlay: {
            mixBlendMode: undefined as any,
          },
        }}
      />
    </>
  );
};

export default PlannerTour;
