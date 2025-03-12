
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

const ContentSchedule = ({ platforms, contentItems, setContentItems }: ContentScheduleProps) => {
  
  const handleDrop = (platformId: string, day: string) => {
    // Create a new content item when a platform is dropped into a cell
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    const newItem: ContentItem = {
      id: uuidv4(),
      platformId,
      day,
      title: `New ${platform.name} task`,
    };
    
    // Check if there's already content for this platform on this day
    const exists = contentItems.some(item => 
      item.platformId === platformId && item.day === day
    );
    
    if (exists) {
      toast.info("There's already content scheduled for this platform on this day");
      return;
    }
    
    setContentItems([...contentItems, newItem]);
    toast.success("Content added to schedule");
  };

  const handleRemoveContent = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
    toast.success("Content removed from schedule");
  };
  
  return (
    <div className="rounded-lg border border-gray-200">
      <div className="grid grid-cols-8 gap-0">
        {/* Header row */}
        <div className="p-6 font-medium text-gray-700">
          Platforms
        </div>
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="p-6 font-medium text-gray-700">
            {day}
          </div>
        ))}
        
        {/* Platform rows */}
        {platforms.map((platform) => (
          <React.Fragment key={platform.id}>
            {/* Platform column */}
            <div className="p-6 border-t border-gray-200 flex items-center">
              <div className="flex items-center gap-2">
                <PlatformIcon platform={platform} size={12} />
                <span className="font-medium">{platform.name}</span>
              </div>
            </div>
            
            {/* Content cells for each day */}
            {DAYS_OF_WEEK.map((day) => {
              const content = contentItems.find(
                item => item.platformId === platform.id && item.day === day
              );
              
              return (
                <Droppable 
                  key={`${platform.id}-${day}`} 
                  droppableId={`${platform.id}-${day}`}
                >
                  {(provided) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="p-4 border-t border-l border-gray-200 min-h-[120px] transition-colors hover:bg-gray-50"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!content) {
                          // Handle the drop event from the platform section
                          const platformId = e.dataTransfer.getData("platformId");
                          if (platformId) {
                            handleDrop(platformId, day);
                          }
                        }
                      }}
                    >
                      {content ? (
                        <div className="bg-white p-4 rounded-md border border-gray-200 h-full shadow-sm relative group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <PlatformIcon platform={platform} size={10} />
                              <span className="font-medium">{platform.name}</span>
                            </div>
                            <button 
                              onClick={() => handleRemoveContent(content.id)}
                              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-sm">{content.title}</p>
                        </div>
                      ) : null}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ContentSchedule;
