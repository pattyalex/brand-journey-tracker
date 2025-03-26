
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type ContentStatus = "scheduled" | "ready" | "draft" | "published";

interface StatusFilterProps {
  statusFilter: ContentStatus | "all";
  setStatusFilter: (status: ContentStatus | "all") => void;
}

const StatusFilter = ({ statusFilter, setStatusFilter }: StatusFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setStatusFilter("all")}
          className={statusFilter === "all" ? "bg-accent" : ""}
        >
          All Content
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => setStatusFilter("draft")}
          className={statusFilter === "draft" ? "bg-accent" : ""}
        >
          Drafts
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setStatusFilter("ready")}
          className={statusFilter === "ready" ? "bg-accent" : ""}
        >
          Ready to Schedule
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setStatusFilter("scheduled")}
          className={statusFilter === "scheduled" ? "bg-accent" : ""}
        >
          Scheduled
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setStatusFilter("published")}
          className={statusFilter === "published" ? "bg-accent" : ""}
        >
          Published
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusFilter;
