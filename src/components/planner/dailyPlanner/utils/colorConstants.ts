/**
 * Shared color constants for Planner components
 */

/**
 * Task Color Palette - 7 categories with 3 shades each (21 colors total)
 * Each color has: fill (background), border (left accent), text color
 */
export const taskColorCategories = {
  stone: {
    name: 'Stone',
    colors: [
      { id: 'stone-light', name: 'Stone Light', fill: '#F0EDEA', border: '#A8A098', text: '#686058' },
      { id: 'stone-medium', name: 'Stone Medium', fill: '#E5E0DA', border: '#908880', text: '#585048' },
      { id: 'stone-deep', name: 'Stone Deep', fill: '#D8D2CA', border: '#787068', text: '#484038' },
    ],
  },
  blue: {
    name: 'Blue',
    colors: [
      { id: 'link-water', name: 'Link Water', fill: '#E8ECF2', border: '#8898B0', text: '#485870' },
      { id: 'echo-blue', name: 'Echo Blue', fill: '#D8E0ED', border: '#7088A8', text: '#384868' },
      { id: 'wedgewood', name: 'Wedgewood', fill: '#C8D4E5', border: '#5878A0', text: '#283858' },
    ],
  },
  lilac: {
    name: 'Lilac',
    colors: [
      { id: 'soft-lilac', name: 'Soft Lilac', fill: '#EDE8F2', border: '#A090B8', text: '#605078' },
      { id: 'wisteria', name: 'Wisteria', fill: '#E0D8EB', border: '#8878A8', text: '#504068' },
      { id: 'violet-haze', name: 'Violet Haze', fill: '#D2C8E0', border: '#706898', text: '#403058' },
    ],
  },
  mauve: {
    name: 'Mauve',
    colors: [
      { id: 'blush-mauve', name: 'Blush Mauve', fill: '#F2E8ED', border: '#B898A8', text: '#785868' },
      { id: 'dusty-rose', name: 'Dusty Rose', fill: '#EADCE5', border: '#A88098', text: '#684058' },
      { id: 'berry-cream', name: 'Berry Cream', fill: '#E0D0D8', border: '#987088', text: '#583048' },
    ],
  },
  sand: {
    name: 'Sand',
    colors: [
      { id: 'oyster', name: 'Oyster', fill: '#F2EDE5', border: '#B8A890', text: '#786850' },
      { id: 'warm-sand', name: 'Warm Sand', fill: '#EAE2D5', border: '#A89878', text: '#685840' },
      { id: 'sandstone', name: 'Sandstone', fill: '#E0D5C5', border: '#988860', text: '#584830' },
    ],
  },
  mint: {
    name: 'Mint',
    colors: [
      { id: 'pistachio', name: 'Pistachio', fill: '#EAF0E8', border: '#90A888', text: '#506848' },
      { id: 'sage-mint', name: 'Sage Mint', fill: '#DCE8D8', border: '#789878', text: '#405838' },
      { id: 'eucalyptus', name: 'Eucalyptus', fill: '#CEDECA', border: '#608868', text: '#304828' },
    ],
  },
  turquoise: {
    name: 'Turquoise',
    colors: [
      { id: 'seafoam', name: 'Seafoam', fill: '#E5F0EE', border: '#80A8A0', text: '#406860' },
      { id: 'aqua-mist', name: 'Aqua Mist', fill: '#D5E8E5', border: '#689890', text: '#305850' },
      { id: 'teal-light', name: 'Teal Light', fill: '#C5DED8', border: '#508880', text: '#204840' },
    ],
  },
};

// Flat array of all task colors for easy lookup
export const allTaskColors = Object.values(taskColorCategories).flatMap(cat => cat.colors);

// Task color options array for simple color picker (first color from each category)
export const taskColorOptions = Object.values(taskColorCategories).map(cat => ({
  name: cat.colors[0].name,
  hex: cat.colors[0].fill,
  border: cat.colors[0].border,
  text: cat.colors[0].text,
}));

// Default task color (Blush Mauve - brand aligned)
export const defaultTaskColor = taskColorCategories.mauve.colors[0];

// Helper to get task color by fill hex value
export const getTaskColorByHex = (hex: string | undefined) => {
  if (!hex) return defaultTaskColor;
  const found = allTaskColors.find(c => c.fill === hex);
  if (found) {
    return { fill: found.fill, border: found.border, text: found.text, name: found.name };
  }
  // Fallback for legacy colors - return default
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
