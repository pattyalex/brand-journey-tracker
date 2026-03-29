import React, { useState } from "react";
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
  // Hide tooltip on floating steps (big picture = 1, anatomy = 5)
  if (index === 1 || index === 3) {
    return <div {...tooltipProps} style={{ display: "none" }} />;
  }

  return (
  <div
    {...tooltipProps}
    className="rounded-2xl bg-white p-6 shadow-2xl border border-[rgba(93,63,90,0.08)]"
    style={{ maxWidth: 380, fontFamily: "inherit" }}
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
      <div className="flex gap-1.5">
        {index !== 2 && Array.from({ length: size }).map((_, i) => (
          <div
            key={i}
            className="w-[6px] h-[6px] rounded-full transition-colors duration-200"
            style={
              i <= index
                ? { backgroundColor: "#612A4F" }
                : { backgroundColor: "transparent", border: "1.5px solid #C4B5C9" }
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        {index === 0 ? (
          <button
            {...skipProps}
            title=""
            className="px-3 py-1.5 text-[13px] font-medium text-[#8B7082] hover:text-[#612A4F] transition-colors outline-none focus:outline-none"
          >
            Skip tour
          </button>
        ) : (
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
          {isLastStep ? "Start creating!" : "Next"}
        </button>
      </div>
    </div>
  </div>
  );
};

// Banner card for the big picture step — matches popup design
const BigPictureBanner: React.FC<{
  onNext: () => void;
  onBack: () => void;
}> = ({ onNext, onBack }) =>
  createPortal(
    <>
      {/* Banner card */}
      <div
        className="fixed left-0 right-0 flex justify-center"
        style={{ zIndex: 10004, bottom: 160 }}
      >
        <div
          className="rounded-2xl bg-white p-6"
          style={{
            boxShadow: "0 8px 30px rgba(93,63,90,0.12)",
            border: "1px solid rgba(93,63,90,0.08)",
            maxWidth: 500,
          }}
        >
          <h3
            className="text-[18px] text-[#612A4F] mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Columns = Big picture view
          </h3>
          <p className="text-[14px] leading-relaxed text-[#4A3D45]">
            See all your content ideas and their progress at a glance.
          </p>
          <div className="flex items-center justify-end mt-5 gap-2">
            <button
              onClick={onBack}
              title=""
              className="px-3 py-1.5 text-[13px] font-medium text-[#8B7082] hover:text-[#612A4F] transition-colors outline-none focus:outline-none"
            >
              Back
            </button>
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
    </>,
    document.body
  );

const ContentHubTour: React.FC<ContentHubTourProps> = ({ run, onComplete, onStepChange }) => {
  // Lift spotlighted targets above the overlay so their content is visible
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

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

  // On steps 1-2 (big picture + open card), elevate ALL columns above the overlay
  // On step 3 (anatomy), give shape-ideas column a higher z-index so its overflow labels show above neighboring columns
  React.useEffect(() => {
    if (stepIndex !== 1 && stepIndex !== 2 && stepIndex !== 3) return;
    const cols = document.querySelectorAll<HTMLElement>('[data-tour^="column-"]');
    cols.forEach((el) => {
      el.style.position = "relative";
      el.style.zIndex = "10001";
    });
    if (stepIndex === 3) {
      const anatomyCol = document.querySelector<HTMLElement>('[data-tour="column-shape-ideas"]');
      if (anatomyCol) {
        anatomyCol.style.zIndex = "10002";
      }
    }
    return () => {
      cols.forEach((el) => {
        el.style.position = "";
        el.style.zIndex = "";
      });
    };
  }, [stepIndex]);

  const [steps] = useState<Step[]>([
    {
      target: '[data-tour="kanban-board"]',
      title: "Welcome to Content Hub",
      content: (
        <p>
          This is the place where you create, shape, and prepare every piece of
          content before it goes live.
        </p>
      ),
      placement: "center" as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="kanban-board"]',
      title: "",
      content: (<></>),
      placement: "center" as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="ideate-card-2"]',
      title: "Click on a card to open it",
      content: (
        <div>
          <p>Opening a card = develop that piece of content.</p>
          <ul className="mt-3 space-y-1.5 text-[13px] text-[#4A3D45]">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#612A4F] flex-shrink-0" />
              Prepare the concept
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#612A4F] flex-shrink-0" />
              Write the script
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#612A4F] flex-shrink-0" />
              Create the filming/shooting plan
            </li>
          </ul>
        </div>
      ),
      placement: "right" as const,
      disableBeacon: true,
      spotlightPadding: 4,
    },
    {
      target: '[data-tour="kanban-board"]',
      title: "",
      content: (<></>),
      placement: "center" as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="column-ideate"]',
      title: "Start with ideas",
      content: (
        <p>
          This is where everything begins. Write down raw ideas, brainstorm
          with MegAI, or quickly capture a hook that came to you at 2am.
        </p>
      ),
      placement: "right" as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="column-shape-ideas"]',
      title: "Move content through stages",
      content: (
        <div>
          <p>
            Each column is a stage in your creation process. Drag cards to the
            right column as your content progresses — from scripting, to filming, to editing,
            until it's ready to go.
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-[12px] text-[#8B7082] font-medium">
            <span className="px-2 py-0.5 rounded-full bg-[rgba(97,42,79,0.06)]">Idea</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-0.5 rounded-full bg-[rgba(97,42,79,0.06)]">Script</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-0.5 rounded-full bg-[rgba(97,42,79,0.06)]">Shoot</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-0.5 rounded-full bg-[rgba(97,42,79,0.06)]">Edit</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-0.5 rounded-full bg-[rgba(97,42,79,0.06)]">Ready</span>
          </div>
        </div>
      ),
      placement: "right" as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="column-ready-to-post"]',
      title: "Ready to go",
      content: (
        <p>
          Once your content is fully produced and ready, it lands here.
          From this point, head to your Calendar to schedule it for posting.
        </p>
      ),
      placement: "left" as const,
      disableBeacon: true,
    },
  ]);

  const goToStep = (idx: number) => {
    setStepIndex(idx);
    onStepChange?.(idx);
  };

  const handleCallback = (data: CallBackProps) => {
    const { status, step, type, action } = data;

    // Elevate the target element above the overlay when a step is shown
    if (type === EVENTS.STEP_BEFORE) {
      setCurrentTarget(step?.target as string || null);
      onStepChange?.(data.index);
    }

    // Advance step on Next click (for non-floating steps)
    if (type === EVENTS.STEP_AFTER) {
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
        onBack={() => goToStep(0)}
      />
    )}
    {run && stepIndex === 3 && createPortal(
      <div
        className="fixed left-0 right-0 flex justify-center"
        style={{ zIndex: 10004, bottom: 160, paddingLeft: 550 }}
      >
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white"
          style={{ boxShadow: "0 8px 30px rgba(93,63,90,0.12)", border: "1px solid rgba(93,63,90,0.08)" }}
        >
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
          overlayColor: "rgba(250, 247, 245, 0.92)",
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
