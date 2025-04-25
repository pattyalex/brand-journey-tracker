
export const HOOK_TONES = [
  { id: "bold", name: "Bold & Edgy" },
  { id: "classy", name: "Classy & Elegant" },
  { id: "fun", name: "Fun & Playful" },
  { id: "emotional", name: "Emotional & Heartfelt" },
  { id: "confident", name: "Confident & Persuasive" }
];

export const toneHooks: { [key: string]: string[] } = {
  "bold": [
    "STOP scrolling! Here's what nobody tells you about...",
    "I bet you've NEVER seen this before...",
    "The ONE thing they don't want you to know...",
    "Warning: This will change everything you thought about...",
    "Breaking: The industry-shocking truth about..."
  ],
  "classy": [
    "Discover the art of perfecting your approach to...",
    "Elevate your experience with these timeless strategies...",
    "The sophisticated guide to mastering...",
    "Unveiling the refined method behind...",
    "A curated approach to excellence in..."
  ],
  "fun": [
    "OMG! You won't believe what happens when...",
    "This hack literally changed my life in 24 hours...",
    "Wait for it... The most entertaining way to...",
    "Plot twist: The fun secret to mastering...",
    "You're doing it wrong! Here's the fun way to..."
  ],
  "emotional": [
    "I never thought I'd share this journey, but...",
    "The moment that changed everything for me...",
    "When everything seemed impossible, this one thing saved me...",
    "My heart broke when I realized this about...",
    "The touching truth behind my success with..."
  ],
  "confident": [
    "Here's exactly how I achieved results in just one week...",
    "The proven 3-step formula that guarantees success...",
    "Why 90% of people fail at this (and how to be in the top 10%)...",
    "Master this skill in 5 simple steps...",
    "The confident approach to conquering..."
  ]
};

export const additionalHooks: { [key: string]: string[] } = {
  "bold": [
    "The shocking truth about...",
    "You won't believe what happens when...",
    "The secret they're hiding from you about...",
    "This changes everything about...",
    "The revolutionary approach to..."
  ],
  "classy": [
    "The refined approach to...",
    "Master the art of...",
    "The elegant solution for...",
    "Transform your understanding of...",
    "The distinguished method for..."
  ],
  "fun": [
    "The most fun way to...",
    "Try this crazy hack for...",
    "The unexpected joy of...",
    "This silly trick actually works for...",
    "The playful secret to..."
  ],
  "emotional": [
    "What no one tells you about the struggle with...",
    "Finding hope when dealing with...",
    "The emotional journey to...",
    "How I found peace with...",
    "The healing truth about..."
  ],
  "confident": [
    "The foolproof method for...",
    "Master this in 7 days...",
    "The expert's guide to...",
    "Never fail again at...",
    "The winning strategy for..."
  ]
};

export const generateHooksByTone = (tone: string): string[] => {
  return toneHooks[tone] || toneHooks["bold"];
};

export const generateAdditionalHooks = (tone: string): string[] => {
  return additionalHooks[tone] || additionalHooks["bold"];
};

// Implementation of the missing generateHooks function
export const generateHooks = async (params: {
  keywords?: string;
  content?: string;
  target?: string;
}): Promise<string[]> => {
  // Log the parameters we received for debugging
  console.log("Generating hooks with parameters:", params);
  
  // Simple implementation that combines hooks from different tones
  // In a real implementation, this would use the keywords, content, and target
  // to generate more relevant hooks
  
  // Get a few hooks from each tone
  const boldHooks = toneHooks["bold"].slice(0, 2);
  const classyHooks = toneHooks["classy"].slice(0, 2);
  const funHooks = toneHooks["fun"].slice(0, 2);
  const emotionalHooks = toneHooks["emotional"].slice(0, 1);
  const confidentHooks = toneHooks["confident"].slice(0, 1);
  
  // Combine them into a single array
  const generatedHooks = [
    ...boldHooks,
    ...classyHooks,
    ...funHooks,
    ...emotionalHooks,
    ...confidentHooks
  ];
  
  // If keywords were provided, create some hooks that include them
  if (params.keywords) {
    const keywords = params.keywords.split(',').map(k => k.trim());
    const keywordHooks = keywords.map(keyword => 
      `The ultimate guide to ${keyword} that nobody is talking about...`
    );
    generatedHooks.push(...keywordHooks);
  }
  
  // If content description was provided, create some hooks based on it
  if (params.content) {
    generatedHooks.push(
      `Want to create amazing content about ${params.content}? Here's how...`,
      `The insider secrets about ${params.content} that will transform your approach...`
    );
  }
  
  // If target audience was provided, create some hooks targeting them
  if (params.target) {
    generatedHooks.push(
      `Attention ${params.target}! This is what you've been missing...`,
      `${params.target} need to know these 3 things before proceeding...`
    );
  }
  
  // Shuffle the array to mix up the hooks
  const shuffled = [...generatedHooks].sort(() => 0.5 - Math.random());
  
  // Return a subset of the hooks (to make it look like we're generating a reasonable amount)
  return shuffled.slice(0, 8);
};

