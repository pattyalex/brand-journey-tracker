/**
 * Time utility functions for the Planner components
 */

/**
 * Convert 12-hour time format to 24-hour format
 * Handles: "9am", "9:00am", "9:00 am", "09:00", etc.
 */
export const parseTimeTo24 = (time: string): string => {
  if (!time) return '';

  // Already in 24-hour format (e.g., "09:00" or "14:30")
  if (/^\d{1,2}:\d{2}$/.test(time) && !time.toLowerCase().includes('am') && !time.toLowerCase().includes('pm')) {
    const [h, m] = time.split(':').map(Number);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // Parse 12-hour format (9am, 9:00am, 9:00 am, etc.)
  const match = time.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (!match) return '';

  let hour = parseInt(match[1], 10);
  const minute = match[2] || '00';
  const period = match[3].toLowerCase();

  // Normalize hour
  if (hour > 12) hour = hour % 12;
  if (hour < 1) hour = 1;

  // Convert to 24-hour
  if (period === 'pm' && hour !== 12) hour += 12;
  else if (period === 'am' && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

/**
 * Convert 24-hour time format to 12-hour format
 * e.g., "14:30" -> "2:30 pm"
 */
export const parse24ToTime12 = (time24: string): string => {
  if (!time24) return '';

  const match = time24.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time24;

  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = hour >= 12 ? 'pm' : 'am';

  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;

  return `${hour}:${minute} ${period}`;
};

/**
 * Format time for display (ensures consistent format)
 */
export const formatTimeDisplay = (time: string): string => {
  const time24 = parseTimeTo24(time);
  if (!time24) return time;
  return parse24ToTime12(time24);
};
