import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Globe, Calendar, Clock } from 'lucide-react';

const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'PST', name: 'Pacific Time', offset: 'UTC-8' },
  { value: 'America/Denver', label: 'MST', name: 'Mountain Time', offset: 'UTC-7' },
  { value: 'America/Chicago', label: 'CST', name: 'Central Time', offset: 'UTC-6' },
  { value: 'America/New_York', label: 'EST', name: 'Eastern Time', offset: 'UTC-5' },
  { value: 'Europe/London', label: 'GMT', name: 'Greenwich Mean Time', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'CET', name: 'Central European Time', offset: 'UTC+1' },
  { value: 'Europe/Bucharest', label: 'EET', name: 'Eastern European Time', offset: 'UTC+2' },
  { value: 'Asia/Tokyo', label: 'JST', name: 'Japan Standard Time', offset: 'UTC+9' },
  { value: 'Australia/Sydney', label: 'AEST', name: 'Australian Eastern Time', offset: 'UTC+10' },
];

interface PreferencesSectionProps {
  selectedTimezone: string;
  handleTimezoneChange: (tz: string) => void;
  firstDayOfWeek: string;
  handleFirstDayChange: (day: string) => void;
}

const PreferencesSection = ({ selectedTimezone, handleTimezoneChange, firstDayOfWeek, handleFirstDayChange }: PreferencesSectionProps) => {
  return (
    <div
      className="bg-white/80 rounded-[20px] p-6"
      style={{
        boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
        border: '1px solid rgba(139, 115, 130, 0.06)',
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)',
            boxShadow: '0 4px 12px rgba(107, 74, 94, 0.2)',
          }}
        >
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            Calendar
          </h2>
          <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Customize your calendar settings
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Timezone */}
        <div>
          <label className="text-sm font-medium text-[#2d2a26] mb-3 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Timezone
          </label>
          <Select value={selectedTimezone} onValueChange={handleTimezoneChange}>
            <SelectTrigger
              className="w-full h-auto pl-4 pr-6 py-3.5 rounded-xl border-[#8B7082]/20 bg-white hover:bg-[#8B7082]/5 transition-all focus:ring-2 focus:ring-[#612a4f]/20 focus:border-[#612a4f]/30"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)',
                    boxShadow: '0 2px 8px rgba(107, 74, 94, 0.15)',
                  }}
                >
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <SelectValue placeholder="Select timezone">
                    {selectedTimezone === 'auto' ? (
                      <div>
                        <p className="font-medium text-[#2d2a26] text-sm">Auto-detect</p>
                        <p className="text-[11px] text-[#8B7082]">Using browser timezone</p>
                      </div>
                    ) : (
                      (() => {
                        const tz = TIMEZONES.find(t => t.value === selectedTimezone);
                        return tz ? (
                          <div>
                            <p className="font-medium text-[#2d2a26] text-sm">{tz.name}</p>
                            <p className="text-[11px] text-[#8B7082]">{tz.label} &bull; {tz.offset}</p>
                          </div>
                        ) : null;
                      })()
                    )}
                  </SelectValue>
                </div>
              </div>
            </SelectTrigger>
            <SelectContent
              className="rounded-xl border-[#8B7082]/20 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <SelectItem
                value="auto"
                className="pl-10 pr-4 py-3 cursor-pointer focus:bg-[#612a4f]/10 focus:text-[#612a4f] rounded-lg mx-1 my-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B7082]/20 to-[#612a4f]/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-[#612a4f]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Auto-detect</p>
                    <p className="text-[11px] text-[#8B7082]">Use browser timezone</p>
                  </div>
                </div>
              </SelectItem>
              <div className="h-px bg-[#8B7082]/10 mx-3 my-1"></div>
              {TIMEZONES.map((tz) => (
                <SelectItem
                  key={tz.value}
                  value={tz.value}
                  className="pl-10 pr-4 py-3 cursor-pointer focus:bg-[#612a4f]/10 focus:text-[#612a4f] rounded-lg mx-1 my-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8B7082]/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#612a4f]">{tz.label}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tz.name}</p>
                      <p className="text-[11px] text-[#8B7082]">{tz.offset}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-px bg-[#8B7082]/10"></div>

        {/* First Day of Week in Calendar */}
        <div>
          <label className="text-sm font-medium text-[#2d2a26] mb-3 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            First Day of Week
          </label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { value: 'monday', label: 'Monday' },
              { value: 'sunday', label: 'Sunday' },
            ].map((day) => (
              <button
                key={day.value}
                onClick={() => handleFirstDayChange(day.value)}
                className={cn(
                  "px-4 py-3 text-sm rounded-xl transition-all",
                  firstDayOfWeek === day.value
                    ? "bg-[#612a4f]/10 text-[#612a4f] font-medium"
                    : "text-[#2d2a26] hover:bg-[#8B7082]/5 border border-[#E8E4E6]"
                )}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {day.label}
              </button>
            ))}
          </div>

          {/* Calendar Preview */}
          {(() => {
            const today = new Date();
            const todayDate = today.getDate();
            const todayDay = today.getDay();

            const getWeekDates = () => {
              const dates: number[] = [];
              let startOffset: number;

              if (firstDayOfWeek === 'monday') {
                startOffset = todayDay === 0 ? -6 : -(todayDay - 1);
              } else {
                startOffset = -todayDay;
              }

              for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(todayDate + startOffset + i);
                dates.push(d.getDate());
              }
              return dates;
            };

            const getNextWeekDates = () => {
              const dates: number[] = [];
              let startOffset: number;

              if (firstDayOfWeek === 'monday') {
                startOffset = todayDay === 0 ? 1 : (8 - todayDay);
              } else {
                startOffset = 7 - todayDay;
              }

              for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(todayDate + startOffset + i);
                dates.push(d.getDate());
              }
              return dates;
            };

            const weekDates = getWeekDates();
            const nextWeekDates = getNextWeekDates();

            return (
              <div
                className="rounded-xl overflow-hidden border border-[#E8E4E6]"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-[#E8E4E6] bg-[#F5F5F5]">
                  {(firstDayOfWeek === 'monday'
                    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                  ).map((day, index) => {
                    const isWeekend = firstDayOfWeek === 'monday'
                      ? index >= 5
                      : index === 0 || index === 6;
                    return (
                      <div
                        key={day}
                        className="py-2.5 text-center transition-all duration-300"
                        style={{
                          borderRight: index < 6 ? '1px solid #E8E4E6' : 'none',
                          backgroundColor: isWeekend ? '#EDEBEC' : undefined,
                        }}
                      >
                        <span
                          className="uppercase tracking-wider text-[11px] font-medium text-[#8B7082]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Grid - Current Week */}
                <div className="grid grid-cols-7 border-b border-[#E8E4E6]">
                  {weekDates.map((date, index) => {
                    const isToday = date === todayDate;
                    const isWeekend = firstDayOfWeek === 'monday'
                      ? index >= 5
                      : index === 0 || index === 6;
                    return (
                      <div
                        key={`week1-${index}`}
                        className="py-3 text-center transition-all duration-300 relative"
                        style={{
                          borderRight: index < 6 ? '1px solid #E8E4E6' : 'none',
                          backgroundColor: isWeekend ? '#F8F7F8' : 'white',
                        }}
                      >
                        <span
                          className={cn(
                            "text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full transition-all",
                            isToday
                              ? "bg-[#8B7082] text-white"
                              : "text-[#2d2a26]"
                          )}
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {date}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Grid - Next Week */}
                <div className="grid grid-cols-7">
                  {nextWeekDates.map((date, index) => {
                    const isWeekend = firstDayOfWeek === 'monday'
                      ? index >= 5
                      : index === 0 || index === 6;
                    return (
                      <div
                        key={`week2-${index}`}
                        className="py-3 text-center transition-all duration-300 relative"
                        style={{
                          borderRight: index < 6 ? '1px solid #E8E4E6' : 'none',
                          backgroundColor: isWeekend ? '#F8F7F8' : 'white',
                        }}
                      >
                        <span
                          className="text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full text-[#2d2a26]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
};

export default PreferencesSection;
