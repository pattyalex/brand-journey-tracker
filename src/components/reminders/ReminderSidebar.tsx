
import { CalendarDays, CheckSquare, List, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ReminderListProps {
  name: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const ReminderList = ({ name, count, active, onClick, icon }: ReminderListProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors",
      active ? "bg-[#8B6B4E] text-white" : "hover:bg-gray-100"
    )}
  >
    <div className="flex items-center gap-2">
      {icon}
      <span>{name}</span>
    </div>
    <span>{count}</span>
  </button>
);

interface ReminderSidebarProps {
  activeList: string;
  counts: Record<string, number>;
  onListSelect: (list: string) => void;
}

const ReminderSidebar = ({ activeList, counts, onListSelect }: ReminderSidebarProps) => {
  return (
    <div className="w-64 p-4 border-r space-y-4">
      <div className="space-y-1">
        <ReminderList
          name="All"
          count={Object.values(counts).reduce((a, b) => a + b, 0)}
          active={activeList === 'all'}
          onClick={() => onListSelect('all')}
          icon={<List className="h-4 w-4" />}
        />
        <ReminderList
          name="Today"
          count={counts.today || 0}
          active={activeList === 'today'}
          onClick={() => onListSelect('today')}
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <ReminderList
          name="Scheduled"
          count={counts.scheduled || 0}
          active={activeList === 'scheduled'}
          onClick={() => onListSelect('scheduled')}
          icon={<Clock className="h-4 w-4" />}
        />
        <ReminderList
          name="Completed"
          count={counts.completed || 0}
          active={activeList === 'completed'}
          onClick={() => onListSelect('completed')}
          icon={<CheckSquare className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};

export default ReminderSidebar;
