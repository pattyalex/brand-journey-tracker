/**
 * Shared color constants for Planner components
 */

/**
 * Curated Task Color Palettes - 6 themed palettes with 5 complementary colors each
 * Each color has: fill (background), border (left accent), text color
 * Designed as cohesive color schemes (like interior design palettes) to reduce choice paralysis
 */
export const taskColorPalettes = {
  sage: {
    id: 'sage',
    name: 'Sage & Stone',
    description: 'Natural earth tones with sage greens',
    colors: [
      { id: 'sage-parchment', name: 'Parchment', fill: '#F5F2EB', border: '#C4B9A0', text: '#6B6050' },
      { id: 'sage-sand', name: 'Sand', fill: '#DDD5C8', border: '#A89880', text: '#5A5040' },
      { id: 'sage-olive', name: 'Olive', fill: '#C5CEBD', border: '#7A8A70', text: '#404838' },
      { id: 'sage-sage', name: 'Sage', fill: '#9CAA92', border: '#687860', text: '#2A3428' },
      { id: 'sage-bark', name: 'Bark', fill: '#8A7B6A', border: '#5A4B3A', text: '#F5F2EB' },
    ],
  },
  ocean: {
    id: 'ocean',
    name: 'Coastal Calm',
    description: 'Serene blues with sandy neutrals',
    colors: [
      { id: 'ocean-foam', name: 'Foam', fill: '#F5F8F8', border: '#A8B8C0', text: '#4A5A68' },
      { id: 'ocean-driftwood', name: 'Driftwood', fill: '#E8E0D8', border: '#A09088', text: '#504840' },
      { id: 'ocean-sky', name: 'Sky', fill: '#C8D8E4', border: '#7090A8', text: '#304050' },
      { id: 'ocean-slate', name: 'Slate', fill: '#8A9EAC', border: '#506878', text: '#F5F8F8' },
      { id: 'ocean-deep', name: 'Deep', fill: '#4A6070', border: '#2A4050', text: '#F5F8F8' },
    ],
  },
  mauve: {
    id: 'mauve',
    name: 'Dusty Rose',
    description: 'Romantic mauves with warm taupes',
    colors: [
      { id: 'mauve-blush', name: 'Blush', fill: '#FAF4F2', border: '#C4A8A0', text: '#685850' },
      { id: 'mauve-rose', name: 'Rose', fill: '#E8D4D0', border: '#A88880', text: '#584848' },
      { id: 'mauve-mauve', name: 'Mauve', fill: '#C8A8A4', border: '#907070', text: '#483838' },
      { id: 'mauve-taupe', name: 'Taupe', fill: '#A89490', border: '#706060', text: '#F8F4F2' },
      { id: 'mauve-plum', name: 'Plum', fill: '#7A6068', border: '#4A3840', text: '#FAF4F2' },
    ],
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Fields',
    description: 'Soft purples with complementary tones',
    colors: [
      { id: 'lavender-cream', name: 'Cream', fill: '#F8F6F2', border: '#C0B8A8', text: '#5A5448' },
      { id: 'lavender-lilac', name: 'Lilac', fill: '#E4DCF0', border: '#9888B8', text: '#484060' },
      { id: 'lavender-sage', name: 'Sage', fill: '#D8E0D4', border: '#8A9880', text: '#404840' },
      { id: 'lavender-dusty', name: 'Dusty Rose', fill: '#E0C8D0', border: '#A08090', text: '#504048' },
      { id: 'lavender-plum', name: 'Plum', fill: '#6A5878', border: '#3A2848', text: '#F6F4F8' },
    ],
  },
  earthy: {
    id: 'earthy',
    name: 'Warm Earth',
    description: 'Rich terracotta with natural complements',
    colors: [
      { id: 'earthy-cream', name: 'Cream', fill: '#FAF6F0', border: '#C4B0A0', text: '#685848' },
      { id: 'earthy-olive', name: 'Olive', fill: '#D8D4C0', border: '#8A8868', text: '#484830' },
      { id: 'earthy-terracotta', name: 'Terracotta', fill: '#D4A088', border: '#A06048', text: '#4A2818' },
      { id: 'earthy-slate', name: 'Slate', fill: '#B8C0C4', border: '#687880', text: '#303840' },
      { id: 'earthy-espresso', name: 'Espresso', fill: '#6A5548', border: '#3A2820', text: '#FAF6F0' },
    ],
  },
  playful: {
    id: 'playful',
    name: 'Sweet Pastels',
    description: 'Cheerful pastels with pops of color',
    colors: [
      { id: 'playful-butter', name: 'Butter', fill: '#FDF6E3', border: '#E0C878', text: '#7A6830' },
      { id: 'playful-blush', name: 'Blush', fill: '#FCE8EC', border: '#E8A0B0', text: '#8A4858' },
      { id: 'playful-sky', name: 'Sky', fill: '#E8F4FC', border: '#88C0E8', text: '#306080' },
      { id: 'playful-mint', name: 'Mint', fill: '#D4F0E0', border: '#70B890', text: '#2A5840' },
      { id: 'playful-coral', name: 'Coral', fill: '#F4A4A0', border: '#C86060', text: '#602828' },
    ],
  },
};

// Legacy support: map old categories to new palettes for backwards compatibility
export const taskColorCategories = {
  stone: {
    name: 'Stone',
    colors: [
      taskColorPalettes.sage.colors[0],
      taskColorPalettes.sage.colors[1],
      taskColorPalettes.sage.colors[4],
    ],
  },
  blue: {
    name: 'Blue',
    colors: [
      taskColorPalettes.ocean.colors[0],
      taskColorPalettes.ocean.colors[2],
      taskColorPalettes.ocean.colors[4],
    ],
  },
  lilac: {
    name: 'Lilac',
    colors: [
      taskColorPalettes.lavender.colors[0],
      taskColorPalettes.lavender.colors[2],
      taskColorPalettes.lavender.colors[4],
    ],
  },
  mauve: {
    name: 'Mauve',
    colors: [
      taskColorPalettes.mauve.colors[0],
      taskColorPalettes.mauve.colors[2],
      taskColorPalettes.mauve.colors[4],
    ],
  },
  sand: {
    name: 'Sand',
    colors: [
      taskColorPalettes.earthy.colors[0],
      taskColorPalettes.earthy.colors[2],
      taskColorPalettes.earthy.colors[4],
    ],
  },
  mint: {
    name: 'Mint',
    colors: [
      taskColorPalettes.sage.colors[0],
      taskColorPalettes.sage.colors[2],
      taskColorPalettes.sage.colors[4],
    ],
  },
};

// Flat array of all task colors from palettes for easy lookup
export const allTaskColors = Object.values(taskColorPalettes).flatMap(palette => palette.colors);

// Also include legacy colors for backwards compatibility
const legacyColors = Object.values(taskColorCategories).flatMap(cat => cat.colors);
export const allTaskColorsWithLegacy = [...allTaskColors, ...legacyColors.filter(
  legacy => !allTaskColors.find(c => c.fill === legacy.fill)
)];

// Task color options array for simple color picker (first color from each palette)
export const taskColorOptions = Object.values(taskColorPalettes).map(palette => ({
  name: palette.colors[0].name,
  hex: palette.colors[0].fill,
  border: palette.colors[0].border,
  text: palette.colors[0].text,
}));

// Default task color (Blush Mauve - brand aligned)
export const defaultTaskColor = taskColorPalettes.mauve.colors[0];

// Helper to get task color by fill hex value
export const getTaskColorByHex = (hex: string | undefined) => {
  if (!hex) return defaultTaskColor;
  // First check palettes
  const foundInPalettes = allTaskColors.find(c => c.fill === hex);
  if (foundInPalettes) {
    return { fill: foundInPalettes.fill, border: foundInPalettes.border, text: foundInPalettes.text, name: foundInPalettes.name };
  }
  // Then check legacy colors
  const foundInLegacy = allTaskColorsWithLegacy.find(c => c.fill === hex);
  if (foundInLegacy) {
    return { fill: foundInLegacy.fill, border: foundInLegacy.border, text: foundInLegacy.text, name: foundInLegacy.name };
  }
  // Fallback for unknown colors - return default
  return defaultTaskColor;
};

/**
 * Color mappings for scheduled/planned content items
 */
export const scheduleColors: Record<string, { bg: string; text: string }> = {
  indigo: { bg: '#e0e7ff', text: '#4338ca' },
  rose: { bg: '#ffe4e6', text: '#be123c' },
  amber: { bg: '#fef3c7', text: '#b45309' },
  emerald: { bg: '#d1fae5', text: '#047857' },
  sky: { bg: '#e0f2fe', text: '#0369a1' },
  violet: { bg: '#ede9fe', text: '#6d28d9' },
  orange: { bg: '#ffedd5', text: '#c2410c' },
  cyan: { bg: '#cffafe', text: '#0e7490' },
  sage: { bg: '#DCE5D4', text: '#5F6B52' },
};

// Default color for all scheduled content cards
export const defaultScheduledColor = { bg: '#8B7082', text: '#ffffff' };

/**
 * Color palette groups for content color picker
 */
export const contentColorGroups = {
  pink: [
    { name: 'pink-1', hex: '#fce7f3' },
    { name: 'pink-2', hex: '#fbcfe8' },
    { name: 'pink-3', hex: '#f8b4d9' },
    { name: 'pink-4', hex: '#f68dc5' },
  ],
  purple: [
    { name: 'purple-1', hex: '#f3e8ff' },
    { name: 'purple-2', hex: '#e9d5ff' },
    { name: 'purple-3', hex: '#dcc4fe' },
    { name: 'purple-4', hex: '#cc9cfd' },
  ],
  blue: [
    { name: 'blue-1', hex: '#dbeafe' },
    { name: 'blue-2', hex: '#bfdbfe' },
    { name: 'blue-3', hex: '#a5cdfc' },
    { name: 'blue-4', hex: '#7ab5fb' },
  ],
  green: [
    { name: 'green-1', hex: '#e6f2eb' },
    { name: 'green-2', hex: '#c8e6d0' },
    { name: 'green-3', hex: '#a5d9b5' },
    { name: 'green-4', hex: '#7ec998' },
  ],
  sage: [
    { name: 'sage-1', hex: '#e8ebe4' },
    { name: 'sage-2', hex: '#d4dbc9' },
    { name: 'sage-3', hex: '#c2ccb0' },
    { name: 'sage-4', hex: '#a8b790' },
  ],
  brown: [
    { name: 'brown-1', hex: '#f5ebe0' },
    { name: 'brown-2', hex: '#e6d5c3' },
    { name: 'brown-3', hex: '#dbc0a0' },
    { name: 'brown-4', hex: '#c69d70' },
  ],
  yellow: [
    { name: 'yellow-1', hex: '#faf6e8' },
    { name: 'yellow-2', hex: '#f5f0d5' },
    { name: 'yellow-3', hex: '#fef3c7' },
    { name: 'yellow-4', hex: '#fde68a' },
  ],
  rosewood: [
    { name: 'rosewood-1', hex: '#f5e8e8' },
    { name: 'rosewood-2', hex: '#e8d4d4' },
    { name: 'rosewood-3', hex: '#d9c0c0' },
    { name: 'rosewood-4', hex: '#c9abab' },
  ],
};

/**
 * Default color palette for new content
 */
export const defaultContentPalette = ['#fdf8f0', '#f0e6de', '#e8ebe6', '#c8d4bc'];

/**
 * Predefined color palettes for quick selection
 */
export const predefinedPalettes = [
  {
    name: 'Soft Neutrals',
    colors: ['#faf6e8', '#f5ebe0', '#e8ebe4', '#c2ccb0'],
  },
  {
    name: 'Warm Sunset',
    colors: ['#fef3c7', '#fde68a', '#f8b4d9', '#f68dc5'],
  },
  {
    name: 'Ocean Breeze',
    colors: ['#dbeafe', '#bfdbfe', '#a5cdfc', '#7ab5fb'],
  },
  {
    name: 'Berry Garden',
    colors: ['#fce7f3', '#fbcfe8', '#e9d5ff', '#cc9cfd'],
  },
  {
    name: 'Earth Tones',
    colors: ['#f5ebe0', '#e6d5c3', '#d4dbc9', '#a8b790'],
  },
];

/**
 * Get all colors as a flat array
 */
export const getAllContentColors = () => {
  return Object.values(contentColorGroups).flat();
};
