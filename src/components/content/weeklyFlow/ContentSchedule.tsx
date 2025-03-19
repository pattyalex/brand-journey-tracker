
import React, { useState } from "react";
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

const ContentSchedule = ({ platforms, contentItems, setContentItems }: ContentScheduleProps) => {
  const [selectedTask, setSelectedTask] = useState<ContentItem | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  const handleDrop = (platformId: string, day: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    const newItem: ContentItem = {
      id: uuidv4(),
      platformId,
      day,
      title: `New ${platform.name} task`,
    };
    
    setContentItems([...contentItems, newItem]);
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
  
  const handleTaskDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  
  const handleTaskDrop = (e: React.DragEvent<HTMLDivElement>, targetDay: string) => {
    e.preventDefault();
    
    // Check if we're dropping a platform or moving an existing task
    const platformId = e.dataTransfer.getData("platformId");
    const taskId = e.dataTransfer.getData("taskId");
    
    if (platformId) {
      // This is a new task from the platform section
      handleDrop(platformId, targetDay);
    } else if (taskId && draggedTaskId) {
      // This is an existing task being moved
      const updatedItems = contentItems.map(item => 
        item.id === taskId ? { ...item, day: targetDay } : item
      );
      setContentItems(updatedItems);
      setDraggedTaskId(null);
    }
  };
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-7 gap-0">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="p-4 font-medium text-gray-700 text-center border-b border-gray-200">
            {day}
          </div>
        ))}
        
        <div className="col-span-7 grid grid-cols-7">
          {DAYS_OF_WEEK.map((day) => {
            const dayContent = contentItems.filter(item => item.day === day);
            
            return (
              <div 
                key={`day-${day}`}
                className="p-3 border border-gray-200 min-h-[300px] flex flex-col gap-2"
                onDragOver={handleTaskDragOver}
                onDrop={(e) => handleTaskDrop(e, day)}
              >
                {dayContent.map((content) => {
                  const platform = platforms.find(p => p.id === content.platformId);
                  if (!platform) return null;
                  
                  return (
                    <div 
                      key={content.id}
                      className="bg-white p-2 rounded-md border border-gray-200 shadow-sm flex items-center gap-2 group hover:shadow-md transition-shadow cursor-move"
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
