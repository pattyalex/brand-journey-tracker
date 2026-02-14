import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import {
  Compass,
  PenTool,
  BarChart3,
  CalendarRange,
  Sliders,
  Sprout,
  type LucideIcon,
} from "lucide-react";

// --- Types ---

interface VerbTag {
  id: string;
  label: string;
  icon: LucideIcon;
  position: { top: string; left: string };
  depth: "near" | "mid" | "far";
  floatDelay: number;
  entranceDelay: number;
}

// --- Constants ---

const VERB_TAGS: VerbTag[] = [
  {
    id: "plan",
    label: "Plan",
    icon: Compass,
    position: { top: "12%", left: "8%" },
    depth: "near",
    floatDelay: 0,
    entranceDelay: 0.2,
  },
  {
    id: "create",
    label: "Create",
    icon: PenTool,
    position: { top: "38%", left: "3%" },
    depth: "mid",
    floatDelay: 0.8,
    entranceDelay: 0.35,
  },
  {
    id: "track",
    label: "Track",
    icon: BarChart3,
    position: { top: "68%", left: "10%" },
    depth: "far",
    floatDelay: 1.6,
    entranceDelay: 0.5,
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: CalendarRange,
    position: { top: "12%", left: "83%" },
    depth: "mid",
    floatDelay: 0.4,
    entranceDelay: 0.3,
  },
  {
    id: "manage",
    label: "Manage",
    icon: Sliders,
    position: { top: "42%", left: "89%" },
    depth: "far",
    floatDelay: 1.2,
    entranceDelay: 0.45,
  },
  {
    id: "grow",
    label: "Grow",
    icon: Sprout,
    position: { top: "70%", left: "85%" },
    depth: "near",
    floatDelay: 2.0,
    entranceDelay: 0.55,
  },
];

const DEPTH_CONFIG = {
  near: {
    opacity: 0.95,
    scale: 1.0,
    iconSize: "w-4 h-4",
    textClass: "text-sm font-semibold",
    padding: "px-3.5 py-2",
    shadow: "0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
    bg: "bg-white/70 backdrop-blur-md",
    iconColor: "text-primary",
    borderOpacity: "border-white/25",
    zIndex: 30,
  },
  mid: {
    opacity: 0.7,
    scale: 0.88,
    iconSize: "w-3.5 h-3.5",
    textClass: "text-xs font-medium",
    padding: "px-3 py-1.5",
    shadow: "0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
    bg: "bg-white/50 backdrop-blur-sm",
    iconColor: "text-purple-500",
    borderOpacity: "border-white/18",
    zIndex: 20,
  },
  far: {
    opacity: 0.45,
    scale: 0.75,
    iconSize: "w-3 h-3",
    textClass: "text-[11px] font-medium",
    padding: "px-2.5 py-1.5",
    shadow: "0 1px 4px rgba(0,0,0,0.03)",
    bg: "bg-white/35 backdrop-blur-[2px]",
    iconColor: "text-purple-300",
    borderOpacity: "border-white/12",
    zIndex: 10,
  },
} as const;

const FOCAL_POINT = { x: 50, y: 72 };

// --- Helpers ---

function getConnectionPath(tag: VerbTag): string {
  const startX = parseFloat(tag.position.left);
  const startY = parseFloat(tag.position.top);
  const endX = FOCAL_POINT.x;
  const endY = FOCAL_POINT.y;

  const cpX = (startX + endX) / 2 + (startX < 50 ? -10 : 10);
  const cpY = (startY + endY) / 2;

  return `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;
}

// --- Subcomponents ---

function ConnectingLines() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      role="presentation"
    >
      <defs>
        {VERB_TAGS.map((tag) => {
          const sx = parseFloat(tag.position.left);
          const sy = parseFloat(tag.position.top);
          return (
            <linearGradient
              key={`grad-${tag.id}`}
              id={`line-grad-${tag.id}`}
              gradientUnits="userSpaceOnUse"
              x1={`${sx}`}
              y1={`${sy}`}
              x2={`${FOCAL_POINT.x}`}
              y2={`${FOCAL_POINT.y}`}
            >
              <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#c4b5fd" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
            </linearGradient>
          );
        })}
      </defs>
      {VERB_TAGS.map((tag) => (
        <motion.path
          key={tag.id}
          d={getConnectionPath(tag)}
          stroke={`url(#line-grad-${tag.id})`}
          strokeWidth="0.3"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: {
              delay: tag.entranceDelay + 0.3,
              duration: 1.2,
              ease: "easeOut",
            },
            opacity: {
              delay: tag.entranceDelay + 0.3,
              duration: 0.4,
            },
          }}
        />
      ))}
    </svg>
  );
}

function VerbCard({ tag }: { tag: VerbTag }) {
  const config = DEPTH_CONFIG[tag.depth];
  const Icon = tag.icon;
  const controls = useAnimation();

  useEffect(() => {
    const startFloat = async () => {
      // Wait for entrance animation to finish
      await new Promise((r) =>
        setTimeout(r, (tag.entranceDelay + 0.6) * 1000)
      );
      controls.start({
        y: [0, -6, 0, 4, 0],
        x: [0, 3, 0, -2, 0],
        transition: {
          duration: 6 + tag.floatDelay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      });
    };
    startFloat();
  }, [controls, tag.entranceDelay, tag.floatDelay]);

  return (
    <motion.div
      className="absolute"
      style={{
        top: tag.position.top,
        left: tag.position.left,
        zIndex: config.zIndex,
      }}
      initial={{ opacity: 0, scale: 0.6, y: 15 }}
      animate={{
        opacity: config.opacity,
        scale: config.scale,
        y: 0,
      }}
      transition={{
        delay: tag.entranceDelay,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        animate={controls}
        className={`
          ${config.bg} ${config.padding}
          rounded-xl border ${config.borderOpacity}
          flex items-center gap-2
          will-change-transform
        `}
        style={{
          boxShadow: config.shadow,
        }}
      >
        <Icon className={`${config.iconSize} ${config.iconColor}`} />
        <span className={`${config.textClass} text-gray-700`}>
          {tag.label}
        </span>
      </motion.div>
    </motion.div>
  );
}

// --- Main Component ---

export default function HeroVerbTags() {
  return (
    <div
      className="absolute inset-0 pointer-events-none hidden md:block"
      aria-hidden="true"
    >
      <ConnectingLines />
      {VERB_TAGS.map((tag) => (
        <VerbCard key={tag.id} tag={tag} />
      ))}
    </div>
  );
}
