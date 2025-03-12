import React from "react";
import { Platform, ContentItem } from "@/types/content-flow";
import PlatformIcon from "./PlatformIcon";
import { v4 as uuidv4 } from "uuid";

interface ContentScheduleProps {
  platforms: Platform[];
  contentItems: ContentItem[];
  setContentItems: (items: ContentItem[]) => void;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ContentSchedule = ({ platforms, contentItems, setContentItems }: ContentScheduleProps) => {
  
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
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const platformId = e.dataTransfer.getData("platformId");
                  if (platformId) {
                    handleDrop(platformId, day);
                  }
                }}
              >
                {dayContent.map((content) => {
                  const platform = platforms.find(p => p.id === content.platformId);
                  if (!platform) return null;
                  
                  return (
                    <div 
                      key={content.id}
                      className="bg-white p-2 rounded-md border border-gray-200 shadow-sm flex items-center gap-2 group"
                    >
                      <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
                        <PlatformIcon platform={platform} size={16} />
                      </div>
                      <span className="text-sm font-medium truncate">{platform.name}</span>
                      <button 
                        onClick={() => handleRemoveContent(content.id)}
                        className="ml-auto text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
    </div>
  );
};

export default ContentSchedule;
