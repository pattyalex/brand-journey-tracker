
import { Button } from "@/components/ui/button";
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { CornerUpLeft } from "lucide-react";

interface RestoreToIdeasButtonProps {
  targetPillarName: string;
  onRestore: (e: React.MouseEvent) => void;
  onButtonMouseEnter: () => void;
  onButtonMouseLeave: () => void;
}

export const RestoreToIdeasButton = ({
  targetPillarName,
  onRestore,
  onButtonMouseEnter,
  onButtonMouseLeave
}: RestoreToIdeasButtonProps) => {
  return (
    <div className="absolute top-2 right-2 z-20">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Restore to Ideas"
              className="h-8 w-8 p-0 bg-white hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
              onClick={onRestore}
              type="button"
              draggable={false}
              onMouseEnter={onButtonMouseEnter}
              onMouseLeave={onButtonMouseLeave}
            >
              <CornerUpLeft className="h-4 w-4 pointer-events-none" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-white text-black border shadow-md">
            <p>Restore to Idea Development ({targetPillarName})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
