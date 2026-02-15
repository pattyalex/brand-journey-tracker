// Shot Template Library - Single source of truth for all shot types

export interface VisualVariant {
  id: string;
  name: string;
  // Image will be loaded from: @/assets/shot-illustrations/{shotId}/{variantId}.png
}

export interface ShotTemplate {
  id: string;
  category: 'talking' | 'detail' | 'context' | 'pattern-break';
  categoryLabel: string;
  user_facing_name: string;
  description: string;
  when_to_use: string[];
  why_it_matters: string[];
  internal_tags: string[];
  visualVariants?: VisualVariant[]; // Optional - if not provided, uses default single image
}

export const shotCategories = [
  { id: 'talking', label: 'Talking / Face-Based Shots', icon: 'user' },
  { id: 'detail', label: 'Detail / B-Roll Shots', icon: 'hand' },
  { id: 'context', label: 'Context / Environment', icon: 'layout' },
  { id: 'pattern-break', label: 'Pattern Breaks / Texture', icon: 'sparkles' },
] as const;

export const shotTemplates: ShotTemplate[] = [
  // Talking / Face-Based Shots
  {
    id: "wide-shot",
    category: "talking",
    categoryLabel: "Talking / Face-Based",
    user_facing_name: "Wide Shot",
    description: "Camera is set farther away, showing more of your body (waist-up, three-quarter, or full body). You can be talking, acting, or silent.",
    when_to_use: [
      "You want to set the scene and give context",
      "You want more of your body/space in frame",
      "Showing outfit, posture, or environment",
      "Opening a video or topic",
      "You want grounded, 'expert' energy",
      "Filming lifestyle moments or calm content",
      "Planning to add text, graphics, or masks later"
    ],
    why_it_matters: [
      "Sets context and location fast",
      "Feels confident and composed",
      "Makes the video feel more intentional and cinematic"
    ],
    internal_tags: ["wide", "establishing", "context", "intro", "lifestyle"],
    visualVariants: [
      { id: "default", name: "Default" },
      { id: "man", name: "Man" },
      { id: "woman", name: "Woman" },
      { id: "woman-city", name: "Woman City" },
      { id: "two-people", name: "Two People" },
    ]
  },
  {
    id: "medium-shot",
    category: "talking",
    categoryLabel: "Talking / Face-Based",
    user_facing_name: "Medium Shot",
    description: "Camera is placed at a comfortable distance, framing you from the chest up. This is the most natural and conversational framing.",
    when_to_use: [
      "Explaining or teaching something",
      "Sharing thoughts or advice",
      "Recording the main body of a video",
      "You want a friendly, relatable tone",
      "You want focus on your face without intensity"
    ],
    why_it_matters: [
      "Feels natural and easy to watch",
      "Most readable and flattering on mobile",
      "Works for almost any type of content",
      "Creates consistency across videos"
    ],
    internal_tags: ["medium", "talking", "conversational", "default", "teaching"],
    visualVariants: [
      { id: "default", name: "Default" },
      { id: "man-talking", name: "Man Talking" },
      { id: "woman-talking", name: "Woman Talking" },
      { id: "woman-podcast", name: "Woman Podcast" },
      { id: "woman-product", name: "Woman Product" },
      { id: "woman-explaining", name: "Woman Explaining" },
    ]
  },
  {
    id: "close-up-shot",
    category: "talking",
    categoryLabel: "Talking / Face-Based",
    user_facing_name: "Close-Up Shot",
    description: "Camera is closer to your face, filling most of the frame. Talking is optional, but facial expression is key.",
    when_to_use: [
      "Delivering the most important line",
      "Emphasizing a key point",
      "Sharing something emotional or personal",
      "Adding intensity or intimacy",
      "Breaking the rhythm of wider shots"
    ],
    why_it_matters: [
      "Instantly grabs attention",
      "Increases emotional impact",
      "Keeps viewers engaged during key moments"
    ],
    internal_tags: ["close", "emphasis", "emotional", "hook", "intense"],
    visualVariants: [
      { id: "default", name: "Default" },
      { id: "man", name: "Man" },
      { id: "woman", name: "Woman" },
    ]
  },

  // Detail / B-Roll Shots
  {
    id: "hands-doing",
    category: "detail",
    categoryLabel: "Detail / B-Roll",
    user_facing_name: "Hands Doing Something",
    description: "Camera focuses on your hands while you're writing, typing, holding an object, preparing food, skincare, etc.",
    when_to_use: [
      "Adding visual variety",
      "Recording voiceovers",
      "Explaining a process",
      "Covering cuts in editing",
      "You don't want to be on camera"
    ],
    why_it_matters: [
      "Prevents face fatigue",
      "Makes edits smoother",
      "Adds texture and realism"
    ],
    internal_tags: ["hands", "b-roll", "detail", "process", "voiceover"],
    visualVariants: [
      { id: "default", name: "Default" },
      { id: "typing", name: "Typing" },
      { id: "bag", name: "Bag" },
      { id: "perfume", name: "Perfume" },
      { id: "resting", name: "Resting" },
      { id: "phone", name: "Phone" },
    ]
  },
  {
    id: "close-detail",
    category: "detail",
    categoryLabel: "Detail / B-Roll",
    user_facing_name: "Close Detail Shot",
    description: "Camera is very close to an object or detail, showing texture, movement, or small actions.",
    when_to_use: [
      "Highlighting a product or object",
      "Showing quality or detail",
      "Creating aesthetic or satisfying visuals",
      "Slowing the pace of a video"
    ],
    why_it_matters: [
      "Elevates production value",
      "Makes content feel more polished",
      "Draws attention to what matters"
    ],
    internal_tags: ["detail", "product", "close", "aesthetic", "texture"],
    visualVariants: [
      { id: "default", name: "Default" },
      { id: "desk", name: "Desk" },
      { id: "skincare", name: "Skincare" },
      { id: "sunglasses", name: "Sunglasses" },
      { id: "trimmer", name: "Trimmer" },
      { id: "jewelry", name: "Jewelry" },
    ]
  },

  // Context / Environment
  {
    id: "at-desk",
    category: "context",
    categoryLabel: "Context / Environment",
    user_facing_name: "In Your Environment",
    description: "The camera shows you within your real environment — your workspace, studio, kitchen, gym, office, café, or any place that represents what you're doing. You may be visible fully or partially.",
    when_to_use: [
      "Grounding the viewer in your world",
      "Adding authenticity and context to your message",
      "Creating behind-the-scenes or day-in-the-life content",
      "Showing where the magic happens"
    ],
    why_it_matters: [
      "Builds trust by showing your real space",
      "Adds depth and personality to your content",
      "Makes viewers feel like insiders"
    ],
    internal_tags: ["workspace", "environment", "behind-scenes", "authentic", "context"],
    visualVariants: [
      { id: "default", name: "Default" },
      { id: "kitchen", name: "Kitchen" },
      { id: "gym", name: "Gym" },
    ]
  },
  {
    id: "moving-through",
    category: "context",
    categoryLabel: "Context / Environment",
    user_facing_name: "Moving Through the Space",
    description: "Camera captures movement—walking, entering a room, or moving through an environment.",
    when_to_use: [
      "Filming routines or lifestyle content",
      "Transitioning between ideas",
      "Adding energy or momentum",
      "Recording voiceovers"
    ],
    why_it_matters: [
      "Adds motion and flow",
      "Keeps the video from feeling static",
      "Helps maintain viewer attention"
    ],
    internal_tags: ["movement", "walking", "transition", "dynamic", "lifestyle"],
    visualVariants: [
      { id: "default", name: "Default" },
      { id: "walking-city", name: "Walking City" },
    ]
  },

  // Pattern Breaks / Texture
  {
    id: "quiet-cutaway",
    category: "pattern-break",
    categoryLabel: "Pattern Breaks / Texture",
    user_facing_name: "Quiet Cutaway",
    description: "A short, neutral shot that isn't the main action (e.g. adjusting something, looking away, pausing).",
    when_to_use: [
      "Transitioning between ideas",
      "Pacing the edit",
      "Giving the viewer a moment to breathe",
      "Breaking up longer talking sections"
    ],
    why_it_matters: [
      "Improves rhythm and flow",
      "Makes edits feel intentional",
      "Prevents visual overload"
    ],
    internal_tags: ["cutaway", "transition", "pause", "pacing", "breath"],
    visualVariants: [
      { id: "default", name: "Default" },
      { id: "earrings", name: "Earrings" },
    ]
  },
  {
    id: "neutral-visual",
    category: "context",
    categoryLabel: "Pattern Breaks / Texture",
    user_facing_name: "Neutral Visual",
    description: "A simple visual of your surroundings or objects (e.g. window, coffee cup, notes, laptop closing, city view).",
    when_to_use: [
      "Adding atmosphere or mood",
      "Showing where you are",
      "Layering under voiceover",
      "Transitioning between sections"
    ],
    why_it_matters: [
      "Adds cinematic texture",
      "Grounds the viewer in a place",
      "Makes content feel elevated and thoughtful"
    ],
    internal_tags: ["atmosphere", "mood", "b-roll", "cinematic", "environment"],
    visualVariants: [
      { id: "city-view", name: "City View" },
      { id: "office", name: "Office" },
      { id: "sky", name: "Sky" },
      { id: "window", name: "Window" },
      { id: "cafe", name: "Cafe" },
    ]
  },
  {
    id: "reaction-moment",
    category: "pattern-break",
    categoryLabel: "Pattern Breaks / Texture",
    user_facing_name: "Reaction Moment",
    description: "A brief moment of natural reaction—nodding, smiling, pausing, or taking a breath.",
    when_to_use: [
      "Adding personality",
      "Creating comedic or emotional beats",
      "Making scripted content feel natural",
      "Breaking monotony"
    ],
    why_it_matters: [
      "Humanizes the video",
      "Improves pacing",
      "Makes content feel less scripted and more real"
    ],
    internal_tags: ["reaction", "emotion", "personality", "human", "natural"],
    visualVariants: [
      { id: "default", name: "Default" },
      { id: "man", name: "Man" },
      { id: "man-angry", name: "Man Angry" },
      { id: "man-bored", name: "Man Bored" },
      { id: "woman", name: "Woman" },
      { id: "woman-smirk", name: "Woman Smirk" },
    ]
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

// Get templates by category
export const getTemplatesByCategory = (category: ShotTemplate['category']): ShotTemplate[] => {
  return shotTemplates.filter(t => t.category === category);
};
