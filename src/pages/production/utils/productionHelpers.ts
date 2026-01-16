export const getPlatformColors = (platform: string): { bg: string; text: string; hover: string } => {
  const lowercased = platform.toLowerCase();
  if (lowercased.includes("instagram") || lowercased === "ig") {
    return { bg: "bg-pink-50 border border-pink-200", text: "text-pink-600", hover: "hover:bg-pink-100" };
  }
  if (lowercased.includes("tiktok") || lowercased === "tt") {
    return { bg: "bg-gray-50 border border-gray-300", text: "text-gray-700", hover: "hover:bg-gray-100" };
  }
  if (lowercased.includes("youtube")) {
    return { bg: "bg-red-50 border border-red-200", text: "text-red-600", hover: "hover:bg-red-100" };
  }
  if (lowercased.includes("facebook")) {
    return { bg: "bg-blue-50 border border-blue-200", text: "text-blue-600", hover: "hover:bg-blue-100" };
  }
  if (lowercased.includes("twitter") || lowercased.includes("x.com") || lowercased.includes("x /") || lowercased.includes("threads")) {
    return { bg: "bg-gray-50 border border-gray-300", text: "text-gray-600", hover: "hover:bg-gray-100" };
  }
  if (lowercased.includes("linkedin")) {
    return { bg: "bg-indigo-50 border border-indigo-200", text: "text-indigo-600", hover: "hover:bg-indigo-100" };
  }
  return { bg: "bg-white border border-gray-200", text: "text-gray-600", hover: "hover:bg-gray-50" };
};

export const getFormatColors = (format: string): { bg: string; text: string; hover: string } => {
  const lowercased = format.toLowerCase();

  // Video formats - all purple (outline style)
  const videoFormats = [
    "talking to camera",
    "static",
    "walking",
    "grwm",
    "get ready with me",
    "voice-over",
    "voice over",
    "voiceover",
    "b-roll",
    "broll",
    "silent video",
    "text overlay",
    "cinematic",
    "montage",
    "pov",
    "first-person",
    "green screen",
    "split screen",
    "duet",
    "stitch"
  ];

  if (videoFormats.some(vf => lowercased.includes(vf))) {
    return { bg: "bg-purple-50 border border-purple-200", text: "text-purple-600", hover: "hover:bg-purple-100" };
  }

  if (lowercased.includes("carousel")) {
    return { bg: "bg-pink-50 border border-pink-200", text: "text-pink-600", hover: "hover:bg-pink-100" };
  }
  if (lowercased.includes("vlog")) {
    return { bg: "bg-indigo-50 border border-indigo-200", text: "text-indigo-600", hover: "hover:bg-indigo-100" };
  }
  if (lowercased.includes("reel")) {
    return { bg: "bg-orange-50 border border-orange-200", text: "text-orange-600", hover: "hover:bg-orange-100" };
  }
  if (lowercased.includes("story") || lowercased.includes("stories")) {
    return { bg: "bg-violet-50 border border-violet-200", text: "text-violet-600", hover: "hover:bg-violet-100" };
  }
  if (lowercased.includes("short")) {
    return { bg: "bg-cyan-50 border border-cyan-200", text: "text-cyan-600", hover: "hover:bg-cyan-100" };
  }
  // Default to gray for unknown formats
  return { bg: "bg-gray-50 border border-gray-200", text: "text-gray-600", hover: "hover:bg-gray-100" };
};

export const getAllAngleTemplates = (idea: string) => [
  `How to use ${idea} to achieve [desired result]`,
  `The biggest mistake people make with ${idea}`,
  `What nobody tells you about ${idea}`,
  `${idea} vs. [alternative approach]`,
  `Complete beginner's guide to ${idea}`,
  `Advanced strategies for ${idea}`,
  `How I used ${idea} to [specific result]`,
  `Common myths about ${idea} debunked`,
  `5 things you need to know before trying ${idea}`,
  `Why ${idea} isn't working for you (and how to fix it)`,
  `The ultimate ${idea} checklist`,
  `${idea}: What I wish I knew when I started`,
  `3 ways to level up your ${idea}`,
  `Is ${idea} worth it? My honest review`,
  `The fastest way to master ${idea}`,
  `Stop doing ${idea} wrong - here's the right way`,
  `The secret to ${idea} that nobody talks about`,
  `${idea} mistakes that are costing you time and money`,
  `How to get started with ${idea} in under 10 minutes`,
  `${idea} hacks that actually work`,
  `The complete ${idea} routine`,
  `${idea} trends you need to know about`,
  `Why everyone is talking about ${idea}`,
  `${idea}: Before and after results`,
  `The truth about ${idea}`,
  `${idea} on a budget: How to save money`,
  `Lazy person's guide to ${idea}`,
  `${idea} for busy people`,
  `Science-backed ${idea} techniques`,
  `${idea} mistakes I made so you don't have to`,
  `How to stay consistent with ${idea}`,
  `${idea}: Setting realistic expectations`,
  `The only ${idea} guide you'll ever need`,
  `${idea} routines of successful people`,
  `How to troubleshoot common ${idea} problems`,
  `${idea}: Quick wins for immediate results`,
  `Why ${idea} is harder than it looks`,
  `${idea} game-changers you need to try`,
  `The ${idea} method that changed my life`,
  `${idea} tips from experts`,
  `How to make ${idea} a habit`,
  `${idea}: What works and what doesn't`,
  `The psychology behind ${idea}`,
  `${idea} for different experience levels`,
  `How to track your ${idea} progress`,
];
