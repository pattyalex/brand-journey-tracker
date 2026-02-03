import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Platform, ContentItem } from "@/types/content-flow";
import PlatformIcon from "./PlatformIcon";
import { getDayNames } from "@/lib/storage";

interface WeeklyAgendaProps {
  platforms: Platform[];
  contentItems: ContentItem[];
  className?: string;
}

const WeeklyAgenda = ({ platforms, contentItems, className }: WeeklyAgendaProps) => {
  const daysOfWeek = getDayNames('full');

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-3 text-center font-medium border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-7">
          {daysOfWeek.map((day) => (
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
