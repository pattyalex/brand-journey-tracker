
import { Card, CardContent } from "@/components/ui/card";
import { Platform } from "@/types/content-flow";

interface WeeklyAgendaProps {
  platforms: Platform[];
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WeeklyAgenda = ({ platforms }: WeeklyAgendaProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b">
          {DAYS_OF_WEEK.map((day) => (
            <div 
              key={day} 
              className="p-3 text-center font-medium border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        
        {platforms.length > 0 ? (
          <div className="divide-y">
            {platforms.map((platform) => (
              <div key={platform.id} className="grid grid-cols-7">
                {DAYS_OF_WEEK.map((day) => (
                  <div 
                    key={`${platform.id}-${day}`} 
                    className="p-4 min-h-[100px] border-r last:border-r-0 relative"
                  >
                    {/* Content cells will go here */}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Add platforms to start planning your weekly content
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyAgenda;
