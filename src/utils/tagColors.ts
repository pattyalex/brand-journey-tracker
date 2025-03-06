
type TagColorMap = {
  [key: string]: string;
};

// Tag colors mapping - tailwind classes
export const tagColorMap: TagColorMap = {
  // Status-based tags
  "to film": "bg-amber-100 text-amber-800",
  "to edit": "bg-emerald-100 text-emerald-800",
  "to post": "bg-sky-100 text-sky-800",
  "posted": "bg-purple-100 text-purple-800",
  "idea": "bg-indigo-100 text-indigo-800",
  "draft": "bg-slate-100 text-slate-800",
  "development": "bg-rose-100 text-rose-800",
  "selection": "bg-fuchsia-100 text-fuchsia-800",
  
  // Default for other tags
  "default": "bg-gray-100 text-gray-800"
};

/**
 * Get tailwind color classes for a tag
 */
export const getTagColorClasses = (tag: string): string => {
  const normalizedTag = tag.toLowerCase().trim();
  
  // Check for exact matches
  if (tagColorMap[normalizedTag]) {
    return tagColorMap[normalizedTag];
  }
  
  // Check if the tag includes any of our keywords
  for (const [key, value] of Object.entries(tagColorMap)) {
    if (normalizedTag.includes(key) && key !== "default") {
      return value;
    }
  }
  
  // Return default styling if no match
  return tagColorMap.default;
};
