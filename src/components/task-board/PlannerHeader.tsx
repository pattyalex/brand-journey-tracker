
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlannerHeaderProps {
  activePage: string;
  setActivePage: (value: string) => void;
}

const PlannerHeader = ({ activePage, setActivePage }: PlannerHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-background pt-20 pb-4 px-6 border-b shadow-sm">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-primary">Planner</h1>
            <p className="text-muted-foreground">Organize and track your content creation tasks</p>
          </div>
        </div>
        
        <Tabs defaultValue="daily-planner" value={activePage} onValueChange={setActivePage}>
          <TabsList className="mb-2 w-full justify-start">
            <TabsTrigger 
              value="daily-planner" 
              className="px-8 py-3 text-base font-medium bg-primary/5 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Daily Planner
            </TabsTrigger>
            <TabsTrigger 
              value="weekly-content-tasks" 
              className="px-8 py-3 text-base font-medium bg-primary/5 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Weekly View
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default PlannerHeader;
