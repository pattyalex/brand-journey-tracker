
import { ContentItem } from "@/types/content";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";

interface ContentCardHeaderProps {
  content: ContentItem;
  date?: Date;
}

export const ContentCardHeader = ({ content, date }: ContentCardHeaderProps) => {
  return (
    <CardHeader className="p-4 pb-2">
      <CardTitle className="text-base font-bold mb-1 line-clamp-2">
        {content.title}
        {date && (
          <Badge variant="outline" className="ml-2 text-xs">
            {format(date, "MMM d")}
          </Badge>
        )}
      </CardTitle>
      <CardDescription className="line-clamp-2 text-xs">
        {content.description}
      </CardDescription>
    </CardHeader>
  );
};
