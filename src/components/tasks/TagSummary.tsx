import React, { useMemo } from 'react';
import { Task, getTagColor } from '@/types/tasks';

interface TagSummaryProps {
  tasks: Task[];
}

function parseDurationToMinutes(dur: string | null): number {
  if (!dur) return 0;
  let total = 0;
  const hMatch = dur.match(/(\d+\.?\d*)h/);
  const mMatch = dur.match(/(\d+)m/);
  if (hMatch) total += parseFloat(hMatch[1]) * 60;
  if (mMatch) total += parseInt(mMatch[1], 10);
  return total;
}

function formatMinutes(mins: number): string {
  if (mins === 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

interface TagData {
  tag: string;
  total: number;
  completed: number;
  minutes: number;
}

const TagSummary: React.FC<TagSummaryProps> = ({ tasks }) => {
  const tagData = useMemo(() => {
    const map: Record<string, TagData> = {};

    tasks.forEach(t => {
      const key = t.tag || '_untagged';
      if (!map[key]) map[key] = { tag: key, total: 0, completed: 0, minutes: 0 };
      map[key].total++;
      if (t.completed) map[key].completed++;
      map[key].minutes += parseDurationToMinutes(t.duration);
    });

    // Sort: tagged first (alphabetical), untagged last
    return Object.values(map).sort((a, b) => {
      if (a.tag === '_untagged') return 1;
      if (b.tag === '_untagged') return -1;
      return a.tag.localeCompare(b.tag);
    });
  }, [tasks]);

  if (tasks.length === 0 || tagData.length === 0) return null;

  const totalTasks = tasks.length;

  return (
    <div className="mt-8 mb-4">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-3">
        Today's breakdown
      </p>
      <div className="space-y-2.5">
        {tagData.map(({ tag, total, completed, minutes }) => {
          const isUntagged = tag === '_untagged';
          const color = isUntagged ? null : getTagColor(tag);
          const ratio = total / totalTasks;

          return (
            <div key={tag} className="flex items-center gap-3">
              {/* Tag label */}
              <span className="w-[72px] flex-shrink-0 text-right">
                {isUntagged ? (
                  <span className="text-[11px] text-gray-300 italic">untagged</span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] px-1.5 py-px rounded-lg"
                    style={{ backgroundColor: color!.bg, color: color!.text }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color!.dot }} />
                    {tag}
                  </span>
                )}
              </span>

              {/* Bar */}
              <div className="flex-1 h-[6px] rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(ratio * 100, 4)}%`,
                    backgroundColor: isUntagged ? '#d1d5db' : color!.dot,
                    opacity: 0.6,
                  }}
                />
              </div>

              {/* Stats */}
              <span className="text-[11px] text-gray-400 tabular-nums flex-shrink-0 w-[100px]">
                {completed}/{total} tasks{minutes > 0 ? ` · ${formatMinutes(minutes)}` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TagSummary;
