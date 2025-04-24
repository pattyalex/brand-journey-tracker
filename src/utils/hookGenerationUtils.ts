
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

