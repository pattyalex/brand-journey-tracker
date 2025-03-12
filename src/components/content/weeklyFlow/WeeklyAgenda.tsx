import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Platform, ContentItem } from "@/types/content-flow";
import PlatformIcon from "./PlatformIcon";

interface WeeklyAgendaProps {
  platforms: Platform[];
  contentItems: ContentItem[];
  className?: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WeeklyAgenda = ({ platforms, contentItems, className }: WeeklyAgendaProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="p-3 text-center font-medium border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Content grid */}
        <div className="grid grid-cols-7">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="min-h-[120px] p-3 border-r last:border-r-0 border-b">
              {/* Content items for this day would go here */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyAgenda;
