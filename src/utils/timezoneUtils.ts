/**
 * Timezone utilities for converting planner/calendar times between timezones.
 *
 * Core idea: each planner item stores the IANA timezone it was created in.
 * When displaying, times are converted from the item's timezone to the user's
 * current timezone — just like Google Calendar.
 */

import type { PlannerItem } from '@/types/planner';

/**
 * Resolve 'auto' to the browser's real IANA timezone identifier.
 */
export function resolveTimezone(selectedTimezone: string): string {
  if (selectedTimezone === 'auto') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return selectedTimezone;
}

/**
 * Convert a wall-clock time from one timezone to another.
 *
 * Example: convertTime("09:00", "2026-04-01", "America/Los_Angeles", "America/New_York")
 *   → { time: "12:00", date: "2026-04-01" }
 *
 * Handles DST transitions and date boundary crossings correctly.
 */
export function convertTime(
  time: string,
  date: string,
  fromTz: string,
  toTz: string
): { time: string; date: string } {
  if (fromTz === toTz) return { time, date };

  const [hour, minute] = time.split(':').map(Number);
  const [year, month, day] = date.split('-').map(Number);

  // Build a UTC timestamp, then adjust by the source timezone's offset
  // to find the real UTC instant that corresponds to this wall-clock time.
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);

  // Get the offset of the source timezone at this approximate instant
  const fromOffset = getTimezoneOffsetMs(fromTz, new Date(utcGuess));

  // The real UTC instant: wall-clock in fromTz = UTC + fromOffset,
  // so UTC = wall-clock - fromOffset
  const utcMs = utcGuess - fromOffset;

  // Now format that UTC instant in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: toTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date(utcMs));
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '0';

  const newHour = get('hour') === '24' ? '00' : get('hour');
  const newMinute = get('minute');
  const newYear = get('year');
  const newMonth = get('month');
  const newDay = get('day');

  return {
    time: `${newHour.padStart(2, '0')}:${newMinute.padStart(2, '0')}`,
    date: `${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`,
  };
}

/**
 * Get a timezone's UTC offset in milliseconds at a given instant.
 * Uses the Intl API to avoid any external library.
 */
function getTimezoneOffsetMs(tz: string, at: Date): number {
  // Format the date in UTC and in the target timezone, then compare
  const utcFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const tzFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const utcParts = utcFormatter.formatToParts(at);
  const tzParts = tzFormatter.formatToParts(at);

  const getNum = (parts: Intl.DateTimeFormatPart[], type: string) => {
    const val = parts.find((p) => p.type === type)?.value || '0';
    return parseInt(val === '24' ? '0' : val, 10);
  };

  const utcDate = Date.UTC(
    getNum(utcParts, 'year'),
    getNum(utcParts, 'month') - 1,
    getNum(utcParts, 'day'),
    getNum(utcParts, 'hour'),
    getNum(utcParts, 'minute'),
    getNum(utcParts, 'second')
  );

  const tzDate = Date.UTC(
    getNum(tzParts, 'year'),
    getNum(tzParts, 'month') - 1,
    getNum(tzParts, 'day'),
    getNum(tzParts, 'hour'),
    getNum(tzParts, 'minute'),
    getNum(tzParts, 'second')
  );

  return tzDate - utcDate;
}

/**
 * Get the date string for an adjacent day.
 * offset: -1 for yesterday, +1 for tomorrow, etc.
 */
export function getAdjacentDate(dateStr: string, offset: number): string {
  const d = new Date(dateStr + 'T12:00:00'); // noon to avoid DST edge cases
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Take an array of planner items (potentially from multiple days) and return
 * only those items that, after timezone conversion, fall on `displayDate`.
 *
 * Items without a stored timezone are assumed to be in the user's current
 * timezone (no conversion needed) — this handles legacy/backfill gracefully.
 */
export function adjustItemsForTimezone(
  items: PlannerItem[],
  displayDate: string,
  userTimezone: string
): PlannerItem[] {
  const result: PlannerItem[] = [];

  for (const item of items) {
    // No time set — not a time-slot task, just include if dates match
    if (!item.startTime || !item.endTime) {
      if (item.date === displayDate) {
        result.push(item);
      }
      continue;
    }

    // No stored timezone or same timezone — no conversion needed
    if (!item.timezone || item.timezone === userTimezone) {
      if (item.date === displayDate) {
        result.push(item);
      }
      continue;
    }

    // Convert from the item's stored timezone to the user's current timezone
    const convertedStart = convertTime(item.startTime, item.date, item.timezone, userTimezone);
    const convertedEnd = convertTime(item.endTime, item.date, item.timezone, userTimezone);

    // Only include if the converted start date matches the display date
    if (convertedStart.date === displayDate) {
      result.push({
        ...item,
        startTime: convertedStart.time,
        endTime: convertedEnd.time,
        // Preserve original date in the item for persistence;
        // the display layer uses the converted times for positioning
      });
    }
  }

  return result;
}
