
import React from "react";
import { Platform, ContentItem } from "@/types/content-flow";
import PlatformIcon from "./PlatformIcon";

interface ContentScheduleProps {
  platforms: Platform[];
  contentItems: ContentItem[];
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const ContentSchedule = ({ platforms, contentItems }: ContentScheduleProps) => {
  return (
    <div className="bg-gray-50 rounded-lg">
      <div className="grid grid-cols-6 gap-0">
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
                <PlatformIcon platform={platform} size={20} />
                <span className="font-medium">{platform.name}</span>
              </div>
            </div>
            
            {/* Content cells for each day */}
            {DAYS_OF_WEEK.map((day) => {
              const content = contentItems.find(
                item => item.platformId === platform.id && item.day === day
              );
              
              return (
                <div 
                  key={`${platform.id}-${day}`}
                  className="p-4 border-t border-l border-gray-200 min-h-[120px]"
                >
                  {content && (
                    <div className="bg-white p-4 rounded-md border border-gray-200 h-full shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <PlatformIcon platform={platform} size={16} />
                        <span className="font-medium">{platform.name}</span>
                      </div>
                      <p className="text-sm">{content.title}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ContentSchedule;
