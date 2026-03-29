import React, { useState } from "react";
import { createPortal } from "react-dom";
import Joyride, { CallBackProps, EVENTS, STATUS, Step, TooltipRenderProps } from "react-joyride";
import { GripVertical, Video, ArrowRight, Maximize2, Lightbulb, PenLine, Camera, Scissors, Send } from "lucide-react";
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
  if (index === 1 || index === 5) {
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
      <p className="text-[14px] text-[#4A3D45] mb-16 text-center max-w-[340px]">
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
          <h4 className="font-medium text-[15px] text-gray-800 leading-[1.4] flex-1">
            3 books that changed how I think about money
          </h4>
          <Maximize2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-1" />
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

        {/* Click to open label — right of card */}
        <div className="absolute flex items-center gap-0" style={{ top: -2, right: -260 }}>
          <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-r-[6px] border-r-[#C4B5C9]" />
          <div style={{ width: 48 }} className="h-px bg-[#C4B5C9]" />
          <Label text="Click any card to open it — that's where the creation process happens" className="max-w-[220px]" />
        </div>

        {/* Format label — left side, arrow points right into video icon */}
        <div className="absolute flex items-center gap-0" style={{ bottom: 42, left: -160 }}>
          <Label text="Content format" />
          <div style={{ width: 56 }} className="h-px bg-[#C4B5C9]" />
          <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[6px] border-l-[#C4B5C9]" />
        </div>

        {/* Platforms label — below card, arrow points up to platform icons */}
        <div className="absolute flex flex-col items-center gap-0" style={{ bottom: -70, right: -45 }}>
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-[#C4B5C9]" />
          <div className="w-px bg-[#C4B5C9]" style={{ height: 60 }} />
          <Label text="Platforms where you'll post the content" className="max-w-[150px] text-center" />
        </div>

        {/* Progress label — below left, arrow points up to dots */}
        <div className="absolute flex flex-col items-center gap-0" style={{ bottom: -95, left: -15 }}>
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-[#C4B5C9]" />
          <div className="w-px bg-[#C4B5C9]" style={{ height: 38 }} />
          <Label text="Steps completed in the creation process" className="max-w-[120px] text-center" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-end w-[340px] mt-32">
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

// Mini card for the board illustration
const MiniCard: React.FC<{ width?: string }> = ({ width = "100%" }) => (
  <div
    className="rounded-[4px] bg-white border border-[rgba(93,63,90,0.1)] px-2 py-1.5"
    style={{ width }}
  >
    <div className="h-[5px] w-[80%] rounded-full bg-[#E8E2E5] mb-1" />
    <div className="flex items-center gap-1">
      <div className="h-[4px] w-[40%] rounded-full bg-[#F0EBE8]" />
    </div>
    <div className="flex items-center gap-[2px] mt-1">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="w-[3px] h-[3px] rounded-full"
          style={i < 2 ? { backgroundColor: "#612A4F" } : { backgroundColor: "transparent", border: "1px solid #C4B5C9" }}
        />
      ))}
    </div>
  </div>
);

// Floating big picture view — board vs card
const FloatingBigPicture: React.FC<{
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}> = ({ onNext, onBack, stepIndex, totalSteps }) => {
  const columns = [
    { name: "Bank of Ideas", icon: Lightbulb, cards: 3 },
    { name: "Script & Concept", icon: PenLine, cards: 2 },
    { name: "To Shoot", icon: Camera, cards: 1 },
    { name: "To Edit", icon: Scissors, cards: 1 },
    { name: "Ready to Post", icon: Send, cards: 2 },
  ];

  return createPortal(
    <>
    {/* Solid background */}
    {document.querySelector("main") && createPortal(
      <div
        className="absolute inset-0"
        style={{ zIndex: 10003, backgroundColor: "#FAF7F5" }}
      />,
      document.querySelector("main")!
    )}
    <div
      className="fixed flex flex-col items-center"
      style={{
        zIndex: 10004,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <h3
        className="text-[18px] mb-3 text-[#612A4F]"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
      >
        Columns = Big picture view of all your content ideas and their progress
      </h3>
      <div className="mb-4" />

      {/* Board illustration — free-standing columns */}
      <div className="flex gap-3 mt-6">
        {columns.map((col) => {
          const Icon = col.icon;
          return (
            <div key={col.name} className="w-[145px]">
              <div
                className="min-h-[220px] rounded-xl p-3"
                style={{
                  border: "1.5px solid rgba(180, 168, 175, 0.25)",
                  backgroundColor: "rgba(255, 252, 250, 0.7)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2 px-0.5">
                  <Icon className="w-3.5 h-3.5 text-[#612A4F] flex-shrink-0" style={{ strokeWidth: 1.5 }} />
                  <span className="text-[10px] font-semibold text-[#612A4F] truncate">{col.name}</span>
                </div>
                <div className="space-y-2">
                  {[...Array(col.cards)].map((_, i) => (
                    <MiniCard key={i} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-end w-full mt-8">
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
};

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
      target: '[data-tour="kanban-board"]',
      title: "",
      content: (<></>),
      placement: "center" as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="shape-card-2"]',
      title: "Opening a card",
      content: (
        <p>
          Opening a card = deep dive into one piece of content. Click any card to
          open it — that's where the creation process happens.
        </p>
      ),
      placement: "left" as const,
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
    {run && stepIndex === 1 && (
      <FloatingBigPicture
        onNext={() => goToStep(2)}
        onBack={() => goToStep(0)}
        stepIndex={1}
        totalSteps={steps.length}
      />
    )}
    {run && stepIndex === 5 && (
      <FloatingAnnotatedCard
        onNext={() => goToStep(6)}
        onBack={() => goToStep(4)}
        stepIndex={5}
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
