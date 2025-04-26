
import { Button } from "@/components/ui/button";
import { ContentItem } from "@/types/content";
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { Send, Trash2, Pencil, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import DateSchedulePicker from "@/components/content/DateSchedulePicker";

interface ContentCardActionsProps {
  content: ContentItem;
  isInCalendarView: boolean;
  isDatePickerOpen: boolean;
  date?: Date;
  calendarButtonRef: React.RefObject<HTMLButtonElement>;
  onSendToCalendar: (e: React.MouseEvent) => void;
  onScheduleButtonClick: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDateChange: (newDate: Date | undefined) => void;
  onDatePickerClose: () => void;
  onButtonMouseEnter: () => void;
  onButtonMouseLeave: () => void;
}

export const ContentCardActions = ({
  content,
  isInCalendarView,
  isDatePickerOpen,
  date,
  calendarButtonRef,
  onSendToCalendar,
  onScheduleButtonClick,
  onDelete,
  onEdit,
  onDateChange,
  onDatePickerClose,
  onButtonMouseEnter,
  onButtonMouseLeave,
}: ContentCardActionsProps) => {
  return (
    <>
      <div className="flex gap-2 z-20 relative">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              {isInCalendarView ? (
                <Button
                  ref={calendarButtonRef}
                  variant={date ? "default" : "outline"}
                  size="icon"
                  aria-label="Schedule Content"
                  className={`h-8 w-8 ${date ? 'bg-green-500 hover:bg-green-600' : ''} cursor-pointer`}
                  onClick={onScheduleButtonClick}
                  type="button"
                  draggable={false}
                  onMouseEnter={onButtonMouseEnter}
                  onMouseLeave={onButtonMouseLeave}
                >
                  <CalendarClock className="h-4 w-4 pointer-events-none" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Send to Content Calendar"
                  className="h-8 w-8 p-0 cursor-pointer"
                  onClick={onSendToCalendar}
                  type="button"
                  draggable={false}
                  onMouseEnter={onButtonMouseEnter}
                  onMouseLeave={onButtonMouseLeave}
                >
                  <Send className="h-4 w-4 pointer-events-none" />
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent 
              side="bottom" 
              align="center" 
              sideOffset={12}
              className="bg-white text-black border border-gray-200 px-4 py-2 text-sm font-medium z-[9999] shadow-lg rounded-md opacity-100 pointer-events-none"
            >
              Send to Content Calendar
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex gap-2 z-20 relative">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onDelete}
          aria-label="Delete"
          className="h-8 w-8 p-0 cursor-pointer"
          type="button"
          draggable={false}
          onMouseEnter={onButtonMouseEnter}
          onMouseLeave={onButtonMouseLeave}
        >
          <Trash2 className="h-4 w-4 pointer-events-none" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEdit}
          aria-label="Edit"
          className="h-8 w-8 p-0 cursor-pointer"
          type="button"
          draggable={false}
          onMouseEnter={onButtonMouseEnter}
          onMouseLeave={onButtonMouseLeave}
        >
          <Pencil className="h-4 w-4 pointer-events-none" />
        </Button>
      </div>

      {isDatePickerOpen && isInCalendarView && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-[9000]"
            onClick={onDatePickerClose}
          />
          <div 
            className="absolute z-[9999]"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: calendarButtonRef.current ? calendarButtonRef.current.offsetTop + calendarButtonRef.current.offsetHeight + 8 : '100%',
              left: calendarButtonRef.current ? calendarButtonRef.current.offsetLeft : 0,
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
              filter: 'drop-shadow(0 0 16px rgba(0, 0, 0, 0.4))',
              borderRadius: '8px',
              backgroundColor: 'white',
              zIndex: 9999
            }}
          >
            <DateSchedulePicker
              date={date}
              onDateChange={onDateChange}
              className="w-full"
            />
          </div>
        </>
      )}
    </>
  );
};
