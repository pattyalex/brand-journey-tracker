
type TagColorMap = {
  [key: string]: string;
};

// Tag colors mapping - tailwind classes
export const tagColorMap: TagColorMap = {
  // Status-based tags
  "to film": "bg-amber-100 text-amber-800",
  "to edit": "bg-emerald-100 text-emerald-800",
  "to post": "bg-orange-100 text-orange-800", // Changed from sky (blue) to orange
  "posted": "bg-green-100 text-green-800",    // Changed from purple to green
  "idea": "bg-rose-100 text-rose-800",        // Changed from indigo (blue) to rose
  "draft": "bg-slate-100 text-slate-800",
  "development": "bg-rose-100 text-rose-800",
  "selection": "bg-teal-100 text-teal-800",   // Changed from fuchsia (purple) to teal
  
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
