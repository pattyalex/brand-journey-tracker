
import React, { useState, useRef, useEffect } from "react";
import { Platform, ContentItem } from "@/types/content-flow";
import PlatformIcon from "./PlatformIcon";
import { v4 as uuidv4 } from "uuid";
import TaskNotesDialog from "./TaskNotesDialog";
import { MessageSquare } from "lucide-react";

interface ContentScheduleProps {
  platforms: Platform[];
  contentItems: ContentItem[];
  setContentItems: (items: ContentItem[]) => void;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Define time slots for consistent horizontal alignment
const TIME_SLOTS = [
  { id: "morning", label: "Morning", start: 0, end: 100 },
  { id: "midday", label: "Midday", start: 100, end: 200 },
  { id: "afternoon", label: "Afternoon", start: 200, end: 300 },
  { id: "evening", label: "Evening", start: 300, end: 400 },
];

const ContentSchedule = ({ platforms, contentItems, setContentItems }: ContentScheduleProps) => {
  const [selectedTask, setSelectedTask] = useState<ContentItem | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTargetCell, setDropTargetCell] = useState<string | null>(null);
  const dayColumnRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Calculate which time slot a position falls into
  const getTimeSlotForPosition = (position: number) => {
    const slot = TIME_SLOTS.find(slot => position >= slot.start && position < slot.end);
    return slot ? slot.id : TIME_SLOTS[TIME_SLOTS.length - 1].id; // Default to last slot if not found
  };
  
  // Function to calculate position based on drop event's Y coordinate
  const calculateDropPosition = (e: React.DragEvent<HTMLDivElement>, dayColumnEl: HTMLDivElement) => {
    const rect = dayColumnEl.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    return offsetY;
  };
  
  // Convert position to a time slot
  const getTimeSlotFromPosition = (position: number | undefined) => {
    if (position === undefined) return TIME_SLOTS[0].id;
    return getTimeSlotForPosition(position);
  };
  
  const handleDrop = (platformId: string, day: string, position: number) => {
    console.log("Handling drop with platformId:", platformId, "day:", day, "position:", position);
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    // Find which time slot this position belongs to
    const timeSlot = getTimeSlotForPosition(position);
    
    const newItem: ContentItem = {
      id: uuidv4(),
      platformId,
      day,
      title: `New ${platform.name} task`,
      position,
      timeSlot,
    };
    
    setContentItems([...contentItems, newItem]);
    setDropTargetCell(null); // Reset highlight
  };

  const handleRemoveContent = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
  };
  
  const handleTaskClick = (task: ContentItem) => {
    setSelectedTask(task);
    setIsNotesDialogOpen(true);
  };
  
  const handleSaveNotes = (taskId: string, notes: string) => {
    const updatedItems = contentItems.map(item => 
      item.id === taskId ? { ...item, notes } : item
    );
    setContentItems(updatedItems);
  };
  
  const getSelectedTaskPlatform = () => {
    if (!selectedTask) return null;
    return platforms.find(p => p.id === selectedTask.platformId) || null;
  };
  
  const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.stopPropagation();
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, cellId: string) => {
    e.preventDefault();
    
    // Check if we have a platformId or taskId being dragged
    const isPlatformDrag = e.dataTransfer.types.includes("platformId");
    const isTaskDrag = e.dataTransfer.types.includes("taskId");
    
    if (isPlatformDrag || isTaskDrag) {
      e.dataTransfer.dropEffect = isPlatformDrag ? "copy" : "move";
      setDropTargetCell(cellId);
    }
  };
  
  const handleDragLeave = () => {
    setDropTargetCell(null);
  };
  
  const handleTaskDrop = (e: React.DragEvent<HTMLDivElement>, targetDay: string, timeSlotId: string) => {
    e.preventDefault();
    setDropTargetCell(null);
    
    // Get the day column element
    const dayColumnEl = dayColumnRefs.current[targetDay];
    if (!dayColumnEl) return;
    
    // Calculate the position within the day column
    const dropPosition = calculateDropPosition(e, dayColumnEl);
    
    // Check if we're dropping a platform or moving an existing task
    const platformId = e.dataTransfer.getData("platformId");
    const taskId = e.dataTransfer.getData("taskId");
    
    console.log("Drop detected:", { platformId, taskId, targetDay, timeSlotId, dropPosition });
    
    if (platformId) {
      // This is a new task from the platform section
      handleDrop(platformId, targetDay, dropPosition);
    } else if (taskId && draggedTaskId) {
      // This is an existing task being moved
      const updatedItems = contentItems.map(item => 
        item.id === taskId ? { ...item, day: targetDay, position: dropPosition, timeSlot: timeSlotId } : item
      );
      setContentItems(updatedItems);
      setDraggedTaskId(null);
    }
  };
  
  // Group content items by time slot
  const getTasksByTimeSlot = () => {
    const tasksBySlot: Record<string, Record<string, ContentItem[]>> = {};
    
    // Initialize structure
    TIME_SLOTS.forEach(slot => {
      tasksBySlot[slot.id] = {};
      DAYS_OF_WEEK.forEach(day => {
        tasksBySlot[slot.id][day] = [];
      });
    });
    
    // Group all content items
    contentItems.forEach(item => {
      const timeSlot = item.timeSlot || getTimeSlotFromPosition(item.position);
      if (!tasksBySlot[timeSlot]) {
        tasksBySlot[timeSlot] = {};
        DAYS_OF_WEEK.forEach(day => {
          tasksBySlot[timeSlot][day] = [];
        });
      }
      
      if (!tasksBySlot[timeSlot][item.day]) {
        tasksBySlot[timeSlot][item.day] = [];
      }
      
      tasksBySlot[timeSlot][item.day].push(item);
    });
    
    return tasksBySlot;
  };
  
  // Update existing content items with time slots based on position
  useEffect(() => {
    const updatedItems = contentItems.map(item => {
      if (!item.timeSlot && item.position !== undefined) {
        return { ...item, timeSlot: getTimeSlotFromPosition(item.position) };
      }
      return item;
    });
    
    if (JSON.stringify(updatedItems) !== JSON.stringify(contentItems)) {
      setContentItems(updatedItems);
    }
  }, []);
  
  const tasksByTimeSlot = getTasksByTimeSlot();
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-7 gap-0">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="p-4 font-medium text-gray-700 text-center border-b border-gray-200">
            {day}
          </div>
        ))}
        
        <div className="col-span-7">
          {TIME_SLOTS.map((timeSlot) => (
            <div key={timeSlot.id} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
              <div className="absolute -left-20 font-medium text-xs text-gray-500 top-1/2 transform -translate-y-1/2">
                {timeSlot.label}
              </div>
              
              {DAYS_OF_WEEK.map((day) => {
                const dayTasks = tasksByTimeSlot[timeSlot.id][day] || [];
                const cellId = `${timeSlot.id}-${day}`;
                const isHighlighted = dropTargetCell === cellId;
                
                return (
                  <div 
                    key={cellId}
                    ref={el => {
                      // Store the first slot of each day as the column reference
                      if (timeSlot.id === TIME_SLOTS[0].id) {
                        dayColumnRefs.current[day] = el;
                      }
                    }}
                    className={`p-3 border-r border-gray-200 last:border-r-0 min-h-[80px] transition-colors ${
                      isHighlighted ? 'bg-blue-50' : ''
                    }`}
                    onDragOver={(e) => handleDragOver(e, cellId)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleTaskDrop(e, day, timeSlot.id)}
                    style={{ height: '100%', position: 'relative' }}
                  >
                    {dayTasks.map((content) => {
                      const platform = platforms.find(p => p.id === content.platformId);
                      if (!platform) return null;
                      
                      return (
                        <div 
                          key={content.id}
                          className="bg-white p-2 rounded-md border border-gray-200 shadow-sm flex items-center gap-2 group hover:shadow-md transition-shadow cursor-grab mb-2"
                          draggable
                          onDragStart={(e) => handleTaskDragStart(e, content.id)}
                          onClick={() => handleTaskClick(content)}
                        >
                          <div className="flex-shrink-0">
                            <PlatformIcon platform={platform} size={16} />
                          </div>
                          <span className="text-sm font-medium truncate flex-grow">{platform.name}</span>
                          
                          {content.notes && (
                            <MessageSquare className="h-3.5 w-3.5 text-blue-500 mr-1 flex-shrink-0" />
                          )}
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveContent(content.id);
                            }}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            aria-label="Remove item"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <TaskNotesDialog
        open={isNotesDialogOpen}
        onOpenChange={setIsNotesDialogOpen}
        task={selectedTask}
        platform={getSelectedTaskPlatform()}
        onSave={handleSaveNotes}
      />
    </div>
  );
};

export default ContentSchedule;
