
import React from "react";
import { Platform, ContentItem } from "@/types/content-flow";
import PlatformIcon from "./PlatformIcon";
import { Droppable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface ContentScheduleProps {
  platforms: Platform[];
  contentItems: ContentItem[];
  setContentItems: (items: ContentItem[]) => void;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_SHORT = ["MON", "TUES", "WED", "THURS", "FRI", "SAT", "SUN"];

const ContentSchedule = ({ platforms, contentItems, setContentItems }: ContentScheduleProps) => {
  
  const handleDrop = (platformId: string, day: string) => {
    // Create a new content item when a platform is dropped into a cell
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    const newItem: ContentItem = {
      id: uuidv4(),
      platformId,
      day,
      title: platform.name.toLowerCase(),
    };
    
    setContentItems([...contentItems, newItem]);
    toast.success("Content added to schedule");
  };

  const handleRemoveContent = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
    toast.success("Content removed from schedule");
  };

  // Group content items by day
  const getContentItemsByDay = (day: string) => {
    return contentItems.filter(item => item.day === day);
  };
  
  return (
    <div className="rounded-lg border border-gray-200 bg-[#f9f5f1]">
      <div className="grid grid-cols-5 gap-0">
        {/* Header row - days only */}
        {DAYS_SHORT.slice(0, 5).map((day, index) => (
          <div key={day} className="p-4 font-bold text-center text-lg">
            {day}
          </div>
        ))}
        
        {/* Content cells for each day */}
        {DAYS_OF_WEEK.slice(0, 5).map((day, dayIndex) => {
          const dayItems = getContentItemsByDay(day);
          
          return (
            <Droppable 
              key={`${day}`} 
              droppableId={`day-${day}`}
            >
              {(provided) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="border border-gray-300 min-h-[300px] transition-colors hover:bg-[#f5f0e8] p-2"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    // Handle the drop event from the platform section
                    const platformId = e.dataTransfer.getData("platformId");
                    if (platformId) {
                      handleDrop(platformId, day);
                    }
                  }}
                >
                  <div className="flex flex-col gap-3">
                    {dayItems.map((item) => {
                      const platform = platforms.find(p => p.id === item.platformId);
                      if (!platform) return null;
                      
                      return (
                        <div 
                          key={item.id} 
                          className="bg-white p-3 rounded border border-gray-200 shadow-sm relative group flex flex-col items-center"
                        >
                          <button 
                            onClick={() => handleRemoveContent(item.id)}
                            className="absolute top-1 right-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <div className="flex flex-col items-center">
                            <PlatformIcon platform={platform} size={24} />
                            <span className="text-sm mt-1">{item.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </div>
  );
};

export default ContentSchedule;
