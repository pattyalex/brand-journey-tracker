// Shot Template Library - Single source of truth for all shot types
// The AI MUST only select from these template IDs

export interface ShotTemplate {
  id: string;
  user_facing_name: string;
  description: string;
  internal_tags: string[];
  overlay_type: 'talking-center' | 'talking-thirds' | 'hands-detail' | 'workspace' | 'walking-pov' | 'reaction' | 'product-focus' | 'side-profile' | 'overhead' | 'screen-share' | 'transition' | 'wide-context';
}

export const shotTemplates: ShotTemplate[] = [
  {
    id: "everyday-talking",
    user_facing_name: "Everyday talking shot",
    description: "Natural, conversational framing - like you're chatting with a friend",
    internal_tags: ["medium", "talking", "conversational", "default", "intro"],
    overlay_type: "talking-center"
  },
  {
    id: "lean-in-emphasis",
    user_facing_name: "Lean in for emphasis",
    description: "Get closer to the camera for an important or emotional point",
    internal_tags: ["close", "talking", "emphasis", "emotional", "hook", "cta"],
    overlay_type: "talking-thirds"
  },
  {
    id: "hands-doing",
    user_facing_name: "Hands doing something",
    description: "Show your hands typing, writing, holding, or demonstrating",
    internal_tags: ["close", "b-roll", "hands", "detail", "tutorial", "demo"],
    overlay_type: "hands-detail"
  },
  {
    id: "at-desk",
    user_facing_name: "At your desk or workspace",
    description: "Show context with your setup, desk, or work environment visible",
    internal_tags: ["wide", "context", "workspace", "setup", "intro", "lifestyle"],
    overlay_type: "workspace"
  },
  {
    id: "walking-through",
    user_facing_name: "Moving through the space",
    description: "Walk and talk, or show movement through your environment",
    internal_tags: ["medium", "walking", "pov", "dynamic", "vlog", "transition"],
    overlay_type: "walking-pov"
  },
  {
    id: "reaction-moment",
    user_facing_name: "Reaction moment",
    description: "A nod, smile, surprised look, or thoughtful pause as a cutaway",
    internal_tags: ["close", "reaction", "cutaway", "emotion", "b-roll"],
    overlay_type: "reaction"
  },
  {
    id: "product-closeup",
    user_facing_name: "Show the thing",
    description: "Focus on a product, object, or item you're talking about",
    internal_tags: ["close", "product", "detail", "showcase", "b-roll", "demo"],
    overlay_type: "product-focus"
  },
  {
    id: "side-angle",
    user_facing_name: "From the side",
    description: "A different angle that adds visual variety and cinematic feel",
    internal_tags: ["medium", "side", "profile", "cinematic", "variety", "b-roll"],
    overlay_type: "side-profile"
  },
  {
    id: "overhead-view",
    user_facing_name: "Bird's eye view",
    description: "Looking down at your desk, hands, or workspace from above",
    internal_tags: ["overhead", "top-down", "b-roll", "aesthetic", "flatlay", "tutorial"],
    overlay_type: "overhead"
  },
  {
    id: "screen-demo",
    user_facing_name: "Screen or device demo",
    description: "Show what's on your screen, phone, or device",
    internal_tags: ["screen", "demo", "tutorial", "tech", "walkthrough"],
    overlay_type: "screen-share"
  },
  {
    id: "scene-setter",
    user_facing_name: "Set the scene",
    description: "Wide shot showing the full environment or location context",
    internal_tags: ["wide", "establishing", "context", "intro", "location", "b-roll"],
    overlay_type: "wide-context"
  },
  {
    id: "quick-transition",
    user_facing_name: "Quick transition shot",
    description: "A brief visual break between scenes - movement blur, object pass-by",
    internal_tags: ["transition", "b-roll", "fast", "dynamic", "cut"],
    overlay_type: "transition"
  }
];

// Helper to get template by ID
export const getShotTemplateById = (id: string): ShotTemplate | undefined => {
  return shotTemplates.find(t => t.id === id);
};

// Get all template IDs (for AI validation)
export const getAllTemplateIds = (): string[] => {
  return shotTemplates.map(t => t.id);
};
