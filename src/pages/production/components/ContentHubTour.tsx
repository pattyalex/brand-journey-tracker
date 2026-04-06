import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Joyride, { CallBackProps, EVENTS, STATUS, Step, TooltipRenderProps } from "react-joyride";
import { ArrowRight } from "lucide-react";

interface ContentHubTourProps {
  run: boolean;
  onComplete: () => void;
  onStepChange?: (index: number) => void;
}

// Custom tooltip for a polished, brand-matched look
const TourTooltip: React.FC<TooltipRenderProps> = ({
  continuous,
  index,
  step,
  size,
  backProps,
  primaryProps,
  skipProps,
  isLastStep,
  tooltipProps,
}) => {
  // Hide tooltip on floating steps (big picture = 1, open card = 2, drag demo = 3, anatomy = 4, ready = 5)
  if (index === 1 || index === 2 || index === 3 || index === 4) {
    return <div {...tooltipProps} style={{ display: "none" }} />;
  }

  return (
  <div
    {...tooltipProps}
    className="rounded-2xl bg-white p-6 shadow-2xl border border-[rgba(93,63,90,0.08)]"
    style={{ maxWidth: 380, fontFamily: "inherit", position: "relative", zIndex: 10002 }}
  >
    {step.title && (
      <h3
        className="text-[18px] mb-2 text-[#612A4F]"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
      >
        {step.title}
      </h3>
    )}
    <div className="text-[14px] leading-relaxed text-[#4A3D45]">
      {step.content}
    </div>

    {/* Step dots + navigation */}
    <div className="flex items-center justify-between mt-5">
      <TourProgressDots currentStep={index} />

      <div className="flex items-center gap-2">
        {index > 1 && (
          <button
            {...backProps}
            title=""
            className="px-3 py-1.5 text-[13px] font-medium text-[#8B7082] hover:text-[#612A4F] transition-colors outline-none focus:outline-none"
          >
            Back
          </button>
        )}
        <button
          {...primaryProps}
          title=""
          className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] outline-none focus:outline-none"
          style={{ backgroundColor: "#612A4F" }}
        >
          {isLastStep ? "Got it!" : "Next"}
        </button>
      </div>
    </div>
  </div>
  );
};

const TOTAL_STEPS = 4;

// Reusable progress dots for all tour popups
// currentStep is the raw stepIndex (1-5), mapped to dot index (0-4)
const TourProgressDots: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="flex gap-1.5">
    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
      <div
        key={i}
        className="w-[6px] h-[6px] rounded-full transition-colors duration-200"
        style={
          i <= currentStep - 1
            ? { backgroundColor: "#612A4F" }
            : { backgroundColor: "transparent", border: "1.5px solid #C4B5C9" }
        }
      />
    ))}
  </div>
);

// Banner card for the big picture step — matches popup design
const TourCloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-[#8B7082]/50 hover:text-[#8B7082] hover:bg-[#8B7082]/10 transition-all"
  >
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  </button>
);

const BigPictureBanner: React.FC<{
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
  showBack?: boolean;
}> = ({ onNext, onBack, onClose, showBack = true }) =>
  createPortal(
    <>
      <style>{`
@keyframes tourBounceIn {
  0% { opacity: 0; transform: scale(0.85) translateY(20px); }
  30% { opacity: 1; transform: scale(1) translateY(0); }
  40% { transform: translateY(-30px); }
  50% { transform: translateY(0); }
  60% { transform: translateY(-18px); }
  70% { transform: translateY(0); }
  80% { transform: translateY(-8px); }
  90%, 100% { transform: translateY(0); }
}
`}</style>
      {/* Banner card */}
      <div
        className="fixed left-0 right-0 flex justify-center"
        style={{ zIndex: 10004, bottom: 160 }}
      >
        <div
          className="rounded-2xl bg-white p-6 relative"
          style={{
            boxShadow: "0 8px 30px rgba(93,63,90,0.12), 0 -8px 30px rgba(93,63,90,0.1)",
            border: "1px solid rgba(93,63,90,0.08)",
            maxWidth: 500,
            animation: "tourBounceIn 1.2s ease-out",
          }}
        >
          <TourCloseButton onClick={onClose} />
          <h3
            className="text-[18px] text-[#612A4F] mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Your Content Pipeline
          </h3>
          <p className="text-[14px] leading-relaxed text-[#4A3D45]">
            Each column represents a step in the content production process so you can see <span className="font-bold">all your ideas</span> at a glance.
          </p>
          <div className="flex items-center justify-between mt-5">
            <TourProgressDots currentStep={1} />
            <div className="flex items-center gap-2">
              {showBack && (
                <button
                  onClick={onBack}
                  title=""
                  className="px-3 py-1.5 text-[13px] font-medium text-[#8B7082] hover:text-[#612A4F] transition-colors outline-none focus:outline-none"
                >
                  Back
                </button>
              )}
              <button
                onClick={onNext}
                title=""
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white outline-none focus:outline-none transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ backgroundColor: "#612A4F" }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );

const ContentHubTour: React.FC<ContentHubTourProps> = ({ run, onComplete, onStepChange }) => {
  // Lift spotlighted targets above the overlay so their content is visible
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(1);
  const [anatomyPos, setAnatomyPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [boardPos, setBoardPos] = useState<{ left: number; width: number; top: number; height: number } | null>(null);
  const [readyColPos, setReadyColPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Track visible board area for centering portals (clamped to viewport)
  useEffect(() => {
    if (!run) return;
    const update = () => {
      const board = document.querySelector<HTMLElement>('[data-tour="kanban-board"]');
      if (board) {
        const rect = board.getBoundingClientRect();
        const visibleLeft = Math.max(0, rect.left);
        const visibleRight = Math.min(window.innerWidth, rect.right);
        setBoardPos({
          left: visibleLeft,
          width: visibleRight - visibleLeft,
          top: rect.top,
          height: rect.height,
        });
      }
    };
    // On steps that scroll the board (2, 5), clear stale position and only measure after scroll settles
    if (stepIndex === 2 || stepIndex === 4) {
      setBoardPos(null);
      const timer = setTimeout(update, 100);
      window.addEventListener("resize", update);
      return () => { clearTimeout(timer); window.removeEventListener("resize", update); };
    }
    update();
    const timer = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(timer); window.removeEventListener("resize", update); };
  }, [run, stepIndex]);


  // Track ready-to-post column position on step 5 (wait for scroll to complete)
  useEffect(() => {
    if (stepIndex !== 4) { setReadyColPos(null); return; }
    const update = () => {
      const el = document.querySelector<HTMLElement>('[data-tour="column-ready-to-post"]');
      if (el) {
        const rect = el.getBoundingClientRect();
        setReadyColPos({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      }
    };
    // Measure after instant scroll completes
    const timer = setTimeout(update, 50);
    window.addEventListener("resize", update);
    return () => { clearTimeout(timer); window.removeEventListener("resize", update); };
  }, [stepIndex]);

  // Track anatomy card position on step 2 — only show after scroll settles
  useEffect(() => {
    if (stepIndex !== 2) { setAnatomyPos(null); return; }
    const update = () => {
      const el = document.querySelector<HTMLElement>('[data-tour="anatomy-card"]');
      if (el) {
        const rect = el.getBoundingClientRect();
        setAnatomyPos({ top: rect.top, left: rect.left, width: rect.width });
      }
    };
    // Measure after instant scroll completes
    const t1 = setTimeout(update, 50);
    // Re-measure on resize
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t1);
      window.removeEventListener("resize", update);
    };
  }, [stepIndex]);

  // Elevate individual column targets above the overlay
  React.useEffect(() => {
    if (!currentTarget || currentTarget === '[data-tour="kanban-board"]') return;
    const el = document.querySelector(currentTarget) as HTMLElement | null;
    if (el) {
      el.style.position = "relative";
      el.style.zIndex = "10001";
      return () => {
        el.style.position = "";
        el.style.zIndex = "";
      };
    }
  }, [currentTarget]);

  // On steps 1-4 (big picture + anatomy + open card + drag demo), elevate ALL columns above the overlay
  // On step 2 (anatomy), give shape-ideas column a higher z-index so its overflow labels show above neighboring columns
  React.useEffect(() => {
    if (stepIndex !== 1 && stepIndex !== 2 && stepIndex !== 3 && stepIndex !== 4) return;
    const cols = document.querySelectorAll<HTMLElement>('[data-tour^="column-"]');
    cols.forEach((el) => {
      el.style.position = "relative";
      el.style.zIndex = "10001";
    });
    // Keep sidebar above elevated columns
    // Keep sidebar above elevated columns — target the fixed sidebar wrapper
    const sidebarEl = document.querySelector<HTMLElement>('[data-sidebar="sidebar"]')?.closest<HTMLElement>('.fixed');
    if (sidebarEl) {
      sidebarEl.style.zIndex = "10003";
    }
    if (stepIndex === 3) {
      const shapeCol = document.querySelector<HTMLElement>('[data-tour="column-shape-ideas"]');
      if (shapeCol) {
        shapeCol.style.zIndex = "10002";
      }
    }
    if (stepIndex === 2) {
      const anatomyCol = document.querySelector<HTMLElement>('[data-tour="column-shape-ideas"]');
      if (anatomyCol) {
        anatomyCol.style.zIndex = "10002";
      }
    }
    // Scroll to start for steps 1 and 3
    // Reset scrollLeft on the kanban board AND all its ancestors
    if (stepIndex === 1 || stepIndex === 3) {
      setTimeout(() => {
        const kanban = document.querySelector<HTMLElement>('[data-tour="kanban-board"]');
        if (kanban) {
          kanban.scrollLeft = 0;
          let parent = kanban.parentElement;
          while (parent && parent !== document.documentElement) {
            if (parent.scrollLeft !== 0) parent.scrollLeft = 0;
            parent = parent.parentElement;
          }
        }
      }, 0);
    }
    // Scroll to center the shape-ideas column for anatomy step (instant to avoid visible jump)
    if (stepIndex === 2) {
      requestAnimationFrame(() => {
        const shapeCol = document.querySelector<HTMLElement>('[data-tour="column-shape-ideas"]');
        if (shapeCol) {
          shapeCol.scrollIntoView({ behavior: "instant", inline: "center", block: "nearest" });
        }
      });
    }
    // Scroll to show the last columns on step 5, hide columns after Ready to Post
    if (stepIndex === 4) {
      // Scroll so Ready to Post column is centered in view (leaves room for tooltip)
      requestAnimationFrame(() => {
        const readyCol = document.querySelector<HTMLElement>('[data-tour="column-ready-to-post"]');
        if (readyCol) {
          readyCol.scrollIntoView({ behavior: "instant", inline: "center", block: "nearest" });
        }
      });
      return () => {
        cols.forEach((el) => {
          el.style.position = "";
          el.style.zIndex = "";
        });
        if (sidebarEl) sidebarEl.style.zIndex = "";
        const kanban = document.querySelector<HTMLElement>('[data-tour="kanban-board"]');
        if (kanban) {
          kanban.scrollTo({ left: 0, behavior: "smooth" });
        }
      };
    }
    return () => {
      cols.forEach((el) => {
        el.style.position = "";
        el.style.zIndex = "";
      });
      if (sidebarEl) sidebarEl.style.zIndex = "";
    };
  }, [stepIndex]);

  const [steps] = useState<Step[]>([
    // Step 0: unused (skipped)
    { target: '[data-tour="kanban-board"]', title: "", content: (<></>), placement: "center" as const, disableBeacon: true },
    // Step 1: Columns overview
    { target: '[data-tour="kanban-board"]', title: "", content: (<></>), placement: "center" as const, disableBeacon: true },
    // Step 2: Anatomy of a card
    { target: '[data-tour="kanban-board"]', title: "", content: (<></>), placement: "center" as const, disableBeacon: true },
    // Step 3: Drag cards
    { target: '[data-tour="kanban-board"]', title: "", content: (<></>), placement: "center" as const, disableBeacon: true },
    // Step 4: Ready to post
    { target: '[data-tour="kanban-board"]', title: "", content: (<></>), placement: "center" as const, disableBeacon: true },
  ]);

  const goToStep = (idx: number) => {
    setStepIndex(idx);
    onStepChange?.(idx);
  };

  const handleClose = () => {
    setCurrentTarget(null);
    setStepIndex(-1);
    onComplete();
  };

  const handleCallback = (data: CallBackProps) => {
    const { status, step, type, action } = data;

    // Elevate the target element above the overlay when a step is shown
    if (type === EVENTS.STEP_BEFORE) {
      setCurrentTarget(step?.target as string || null);
      onStepChange?.(data.index);
    }

    // Advance step on Next click (only for step 0 which uses Joyride's built-in tooltip)
    // Steps 1-5 are floating custom portals that handle their own navigation
    if (type === EVENTS.STEP_AFTER && data.index === 0) {
      if (action === "next") {
        goToStep(data.index + 1);
      } else if (action === "prev") {
        goToStep(data.index - 1);
      }
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setCurrentTarget(null);
      setStepIndex(-1);
      onComplete();
    }
  };

  return (
    <>
    {run && stepIndex === 1 && (
      <BigPictureBanner
        onNext={() => goToStep(2)}
        onBack={() => {}}
        onClose={handleClose}
        showBack={false}
      />
    )}
    {/* Step 3 — "Drag cards to advance them" centered in visible board area */}
    {run && stepIndex === 3 && boardPos && createPortal(
      <div
        className="fixed"
        style={{
          zIndex: 10004,
          bottom: 180,
          left: boardPos.left + boardPos.width / 2,
          transform: "translateX(-50%)",
        }}
      >
        <div
          className="rounded-2xl bg-white p-6 relative"
          style={{
            boxShadow: "0 8px 30px rgba(93,63,90,0.12), 0 -8px 30px rgba(93,63,90,0.1)",
            border: "1px solid rgba(93,63,90,0.08)",
            maxWidth: 380,
          }}
        >
          <TourCloseButton onClick={handleClose} />
          <h3
            className="text-[18px] text-[#612A4F] mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Drag cards to advance them
          </h3>
          <p className="text-[14px] leading-relaxed text-[#4A3D45]">
            Move cards to the next column as your content progresses
          </p>
          <div className="flex items-center justify-between mt-5">
            <TourProgressDots currentStep={3} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToStep(2)}
                title=""
                className="px-3 py-1.5 text-[13px] font-medium text-[#8B7082] hover:text-[#612A4F] transition-colors outline-none focus:outline-none"
              >
                Back
              </button>
              <button
                onClick={() => goToStep(4)}
                title=""
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white outline-none focus:outline-none transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ backgroundColor: "#612A4F" }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
    {/* Step 2 — Anatomy card labels */}
    {run && stepIndex === 2 && createPortal(
      <>
        {/* Title + subtitle above the card */}
        {anatomyPos && <div
          className="fixed"
          style={{
            zIndex: 10004,
            top: anatomyPos.top - 130,
            left: anatomyPos.left,
            width: anatomyPos.width,
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              className="rounded-2xl bg-white p-6 relative"
              style={{ boxShadow: "0 -6px 20px rgba(93,63,90,0.1), 0 4px 12px rgba(93,63,90,0.08)", border: "none", width: anatomyPos.width }}
            >
              <button
                onClick={handleClose}
                className="absolute top-1.5 right-2 w-5 h-5 flex items-center justify-center rounded-full text-[#8B7082]/50 hover:text-[#8B7082] hover:bg-[#8B7082]/10 transition-all"
              >
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
              <h3
                className="text-[18px] text-[#612A4F] text-center"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Here's what each part of a card means:
              </h3>
            </div>
            {/* Arrow pointing down */}
            <div
              style={{
                position: "absolute",
                bottom: -14,
                left: "50%",
                transform: "translateX(-50%)",
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
                  top: -10,
                  left: 4,
                  boxShadow: "0 8px 30px rgba(93,63,90,0.12)",
                }}
              />
            </div>
          </div>
        </div>}
        {/* Back / Next buttons at the bottom — centered in visible board area, right-aligned on small screens */}
        {boardPos && (
          <div
            className="fixed"
            style={{
              zIndex: 10004,
              bottom: 160,
              ...(window.innerWidth < 1200
                ? { right: 24 }
                : { left: boardPos.left + boardPos.width / 2, transform: "translateX(-50%)" }),
            }}
          >
            <div
              className="flex items-center gap-5 px-5 py-3 rounded-2xl bg-white"
              style={{ boxShadow: "0 8px 30px rgba(93,63,90,0.12)", border: "1px solid rgba(93,63,90,0.08)" }}
            >
              <TourProgressDots currentStep={2} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToStep(1)}
                  title=""
                  className="px-3 py-1.5 text-[13px] font-medium text-[#8B7082] hover:text-[#612A4F] transition-colors outline-none focus:outline-none"
                >
                  Back
                </button>
                <button
                  onClick={() => goToStep(3)}
                  title=""
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white outline-none focus:outline-none transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ backgroundColor: "#612A4F" }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </>,
      document.body
    )}
    {/* Step 5 — "Ready to go" positioned next to ready-to-post column (only render once position is known) */}
    {run && stepIndex === 4 && readyColPos && createPortal(
      <div
        className="fixed"
        style={{
          zIndex: 10004,
          top: "47%",
          transform: "translateY(-50%)",
          left: Math.max(16, readyColPos.left - 460),
        }}
      >
        <div style={{ position: "relative" }}>
        <div
          className="rounded-2xl bg-white p-6 relative"
          style={{
            boxShadow: "0 8px 30px rgba(93,63,90,0.12), 0 -8px 30px rgba(93,63,90,0.1)",
            border: "1px solid rgba(93,63,90,0.08)",
            maxWidth: 470,
          }}
        >
          <TourCloseButton onClick={handleClose} />
          <h3
            className="text-[18px] text-[#612A4F] mb-2 whitespace-nowrap"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Finally, go to Calendar to schedule your content
          </h3>
          <p className="text-[14px] leading-relaxed text-[#4A3D45]">
            Once your content is fully produced and ready to post, it lands in this column.
          </p>
          <p className="text-[14px] leading-relaxed text-[#4A3D45] mt-3">
            From this point, head to your Calendar to schedule it for posting.
          </p>
          <div className="flex items-center justify-between mt-5">
            <TourProgressDots currentStep={4} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToStep(3)}
                title=""
                className="px-3 py-1.5 text-[13px] font-medium text-[#8B7082] hover:text-[#612A4F] transition-colors outline-none focus:outline-none"
              >
                Back
              </button>
              <button
                onClick={() => { onComplete(); }}
                title=""
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white outline-none focus:outline-none transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ backgroundColor: "#612A4F" }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
        {/* Arrow pointing right */}
        <div
          style={{
            position: "absolute",
            right: -18,
            top: "50%",
            transform: "translateY(-50%)",
            width: 18,
            height: 36,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              backgroundColor: "#FFFFFF",
              transform: "rotate(45deg)",
              position: "absolute",
              left: -13,
              top: 5,
              boxShadow: "0 8px 30px rgba(93,63,90,0.12)",
            }}
          />
        </div>
        </div>
      </div>,
      document.body
    )}
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress={false}
      showSkipButton
      scrollToFirstStep
      scrollOffset={100}
      disableScrollParentFix={false}
      spotlightPadding={8}
      tooltipComponent={TourTooltip}
      callback={handleCallback}
      floaterProps={{
        disableAnimation: false,
        styles: {
          floater: {
            filter: "drop-shadow(0 8px 24px rgba(93,63,90,0.15))",
          },
        },
      }}
      styles={{
        options: {
          primaryColor: "#612A4F",
          zIndex: 10000,
          arrowColor: "#FFFFFF",
          overlayColor: "rgba(250, 247, 245, 0.65)",
        },
        spotlight: {
          borderRadius: 20,
        },
        overlay: {
          mixBlendMode: undefined as any,
        },
      }}
    />
    </>
  );
};

export default ContentHubTour;
