export interface ParsedTask {
  title: string;
  time: string | null;
  end_time: string | null;
  duration: string | null;
  tag: string | null;
}

function parseTimeToken(token: string): { h: number; m: number } | null {
  // "8am", "8:30pm", "13:30", "8", "8:30"
  const match = token.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3]?.toLowerCase();
  if (ampm === 'pm' && h < 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}

function fmt(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseTaskInput(raw: string): ParsedTask {
  let text = raw.trim();
  let time: string | null = null;
  let end_time: string | null = null;
  let duration: string | null = null;
  let tag: string | null = null;

  // 1. Time range prefix: "9-10:30 task", "9am-11am task", "9:30-10 task"
  const rangeMatch = text.match(/^(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s+/i);
  if (rangeMatch) {
    const start = parseTimeToken(rangeMatch[1].trim());
    const end = parseTimeToken(rangeMatch[2].trim());
    if (start && end) {
      time = fmt(start.h, start.m);
      end_time = fmt(end.h, end.m);
      const startMins = start.h * 60 + start.m;
      const endMins = end.h * 60 + end.m;
      const diff = endMins > startMins ? endMins - startMins : endMins + 1440 - startMins;
      if (diff >= 60) {
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        duration = mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
      } else {
        duration = `${diff}m`;
      }
      text = text.slice(rangeMatch[0].length);
    }
  }

  // 2. Single time prefix: "8am", "8:30", "13:30", "2pm"
  if (!time) {
    const timeMatch = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s+/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3]?.toLowerCase();

      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;

      if (!ampm && !timeMatch[2] && h > 23) {
        // Don't parse — not a valid time
      } else if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        time = fmt(h, m);
        text = text.slice(timeMatch[0].length);
      }
    }
  }

  // 3. Duration suffix: "1h", "30m", "2 hours", "1hr"
  if (!duration) {
    const durMatch = text.match(/\s+(\d+\.?\d*)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)\s*$/i);
    if (durMatch) {
      const val = parseFloat(durMatch[1]);
      const unit = durMatch[2].toLowerCase();
      if (unit.startsWith('h')) {
        duration = val === 1 ? '1h' : `${val}h`;
      } else {
        duration = val === 1 ? '1m' : `${Math.round(val)}m`;
      }
      text = text.slice(0, durMatch.index!).trimEnd();
    }
  }

  // 4. Hash tag: "#heymeg"
  const tagMatch = text.match(/#(\w+)/);
  if (tagMatch) {
    tag = tagMatch[1].toLowerCase();
    text = text.replace(tagMatch[0], '').replace(/\s{2,}/g, ' ').trim();
  }

  return { title: text, time, end_time, duration, tag };
}

export function formatTime12(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${ampm}`;
}

export function formatTimeShort(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  if (m === '00') return `${h12} ${ampm}`;
  return `${h12}:${m} ${ampm}`;
}
