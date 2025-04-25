
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LinkManagerProps {
  links: string[];
  onRemoveLink: (index: number) => void;
  onOpenLinkDialog: () => void;
}

const LinkManager = ({ links, onRemoveLink, onOpenLinkDialog }: LinkManagerProps) => {
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenLinkDialog}
              className="h-6 w-6 p-0 flex items-center justify-center bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              <LinkIcon className="h-2.5 w-2.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="min-w-[90px] px-4 py-1.5 text-center" sideOffset={10} align="start">
            <p className="text-xs">Add link</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {links.map((link, index) => (
        <Badge 
          key={index} 
          variant="outline" 
          className="flex items-center gap-1 bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 h-5 px-1 py-0 text-[10px]"
        >
          <LinkIcon className="h-2 w-2" />
          <span className="max-w-[150px] truncate text-[10px]">{link}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveLink(index)}
            className="h-3 w-3 p-0 hover:bg-transparent hover:text-purple-800"
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      ))}
    </>
  );
};

export default LinkManager;
