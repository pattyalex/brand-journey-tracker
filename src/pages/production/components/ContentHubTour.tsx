import React, { useState } from "react";
import { createPortal } from "react-dom";
import Joyride, { CallBackProps, EVENTS, STATUS, Step, TooltipRenderProps } from "react-joyride";
import { GripVertical, Video, ArrowRight } from "lucide-react";
import { SiInstagram, SiTiktok } from "react-icons/si";

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
  // Hide tooltip on the floating card step (index 3)
  if (index === 3) {
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

    {/* Step dots */}
    <div className="flex items-center justify-between mt-5">
      <div className="flex gap-1.5">
        {Array.from({ length: size }).map((_, i) => (
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

// Annotation label
const Label: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => (
  <span
    className={`text-[12px] font-semibold px-2.5 py-1 rounded-md ${className}`}
    style={{ backgroundColor: "#EDE3E8", color: "#612A4F" }}
  >
    {text}
  </span>
);

// Floating annotated card rendered directly on the page
const FloatingAnnotatedCard: React.FC<{
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}> = ({ onNext, onBack, stepIndex, totalSteps }) =>
  createPortal(
    <>
    <div
      className="fixed flex flex-col items-center"
      style={{
        zIndex: 10004,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -55%)",
      }}
    >
      {/* Title */}
      <h3
        className="text-[18px] mb-3 text-[#612A4F]"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
      >
        Each card represents a piece of content
      </h3>
      <p className="text-[14px] text-[#4A3D45] mb-10 text-center max-w-[340px]">
        Here's what each part means:
      </p>

      {/* The card */}
      <div
        className="relative rounded-[14px] bg-white border border-[rgba(93,63,90,0.08)] p-4 w-[340px] overflow-visible"
        style={{ boxShadow: "0 8px 40px rgba(93,63,90,0.15)" }}
      >
        {/* Row 1: Grip + Title */}
        <div className="flex items-start gap-2.5">
          <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
          <h4 className="font-medium text-[15px] text-gray-800 leading-[1.4]">
            3 books that changed how I think about money
          </h4>
        </div>

        {/* Row 2: Format + Platforms */}
        <div className="flex items-center justify-between mt-3">
          <span className="inline-flex items-center gap-1 text-[12px] text-gray-500/80 font-normal">
            <Video className="w-3 h-3" />
            Voice-over
          </span>
          <div className="flex gap-1.5 items-center">
            <SiInstagram className="w-3.5 h-3.5 text-[#8B7082]" />
            <SiTiktok className="w-3.5 h-3.5 text-[#8B7082]" />
          </div>
        </div>

        {/* Row 3: Progress dots */}
        <div className="mt-3 pt-2.5 border-t border-[#E8E2E5]">
          <div className="flex items-center gap-1.5">
            {[true, true, false, false, false, false].map((filled, i) => (
              <div
                key={i}
                className="w-[6px] h-[6px] rounded-full"
                style={
                  filled
                    ? { backgroundColor: "#612A4F" }
                    : { backgroundColor: "transparent", border: "1.5px solid #C4B5C9" }
                }
              />
            ))}
          </div>
        </div>

        {/* Labels positioned absolutely around the card */}
        {/* Drag label — left of grip, line stops right before grip icon */}
        <div className="absolute flex items-center gap-0" style={{ top: 15, left: -90 }}>
          <Label text="Drag" />
          <div style={{ width: 50 }} className="h-px bg-[#C4B5C9]" />
          <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[6px] border-l-[#C4B5C9]" />
        </div>

        {/* Title label — right of title, arrow points left into title */}
        <div className="absolute flex items-center gap-0" style={{ top: 18, right: -115 }}>
          <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-r-[6px] border-r-[#C4B5C9]" />
          <div style={{ width: 58 }} className="h-px bg-[#C4B5C9]" />
          <Label text="Title / Hook" />
        </div>

        {/* Format label — left side, arrow points right into video icon */}
        <div className="absolute flex items-center gap-0" style={{ bottom: 42, left: -160 }}>
          <Label text="Content format" />
          <div style={{ width: 56 }} className="h-px bg-[#C4B5C9]" />
          <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[6px] border-l-[#C4B5C9]" />
        </div>

        {/* Platforms label — right side of card, arrow points left to platform icons */}
        <div className="absolute flex items-center gap-0" style={{ bottom: 26, right: -222 }}>
          <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-r-[6px] border-r-[#C4B5C9]" />
          <div style={{ width: 50 }} className="h-px bg-[#C4B5C9]" />
          <Label text="Platforms where you'll post the content" className="max-w-[180px]" />
        </div>

        {/* Progress label — below left, arrow points up to dots */}
        <div className="absolute flex flex-col items-center gap-0" style={{ bottom: -85, left: 10 }}>
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-[#C4B5C9]" />
          <div className="w-px bg-[#C4B5C9]" style={{ height: 30 }} />
          <Label text="Steps completed in the creation process" className="max-w-[120px] text-center" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-end w-[340px] mt-24">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-[13px] font-medium text-[#8B7082] hover:text-[#612A4F] transition-colors outline-none"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white outline-none transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
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

  React.useEffect(() => {
    // Only elevate individual column targets, not the whole board
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
      target: '[data-tour="kanban-board"]',
      title: "",
      content: (<></>),
      placement: "center" as const,
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
    {run && stepIndex === 3 && (
      <FloatingAnnotatedCard
        onNext={() => goToStep(4)}
        onBack={() => goToStep(2)}
        stepIndex={3}
        totalSteps={steps.length}
      />
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
