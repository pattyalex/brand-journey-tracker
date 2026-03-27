import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from "date-fns";
import { getDateString } from "../utils/plannerUtils";
import { getWeekStartsOn } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { usePlannerContext } from "@/contexts/PlannerContext";

export const WeekHeader = () => {
  const { selectedDate, contentDisplayMode } = usePlannerContext();
  return (
    <div className="flex">
      {/* Time column header */}
      <div className="flex-shrink-0 h-[60px]" style={{ width: '40px' }}>
      </div>
      {/* Day headers */}
      <div className="flex-1 grid grid-cols-7 gap-0">
        {eachDayOfInterval({
          start: startOfWeek(selectedDate, { weekStartsOn: getWeekStartsOn() }),
          end: endOfWeek(selectedDate, { weekStartsOn: getWeekStartsOn() })
        }).map((day, index) => {
          const isToday = isSameDay(day, new Date());
          const isPast = day < new Date() && !isToday;
          return (
            <div
              key={getDateString(day)}
              className={cn(
                "h-[60px] flex flex-col items-center justify-center transition-colors hover:bg-gray-100",
                isToday
                  ? 'bg-white/50'
                  : 'bg-white/30'
              )}
              style={{
                borderRight: 'none',
                opacity: isPast ? 0.5 : 1
              }}
            >
              <div className="uppercase tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '12px', color: '#6b7280' }}>
                {format(day, "EEE")}
              </div>
              <div className={cn(
                "text-sm font-semibold",
                isToday
                  ? "bg-[#8B7082] text-white w-7 h-7 rounded-full flex items-center justify-center"
                  : "text-gray-900"
              )} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
