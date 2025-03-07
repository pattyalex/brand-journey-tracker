
type TagColorMap = {
  [key: string]: string;
};

// Tag colors mapping - tailwind classes
export const tagColorMap: TagColorMap = {
  // Status-based tags
  "to film": "bg-blue-900 text-blue-100", // Dark navy blue
  "film": "bg-blue-900 text-blue-100", // Dark navy blue
  "to edit": "bg-yellow-500 text-yellow-50", // More intense yellow
  "edit": "bg-yellow-500 text-yellow-50", // More intense yellow
  "to post": "bg-green-100 text-green-800",
  "posted": "bg-amber-100 text-amber-800", // Brown-ish color
  "idea": "bg-pink-100 text-pink-800",
  "finalize script": "bg-red-600 text-white", // More intense red
  "to finalize script": "bg-red-600 text-white", // More intense red
  "script": "bg-red-600 text-white", // More intense red
  
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
