
import { useState } from "react";
import { Lightbulb, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentItem } from "@/types/content";
import { Pillar } from "@/pages/BankOfContent";
import ContentPillar from "./ContentPillar";
import ContentUploader from "./ContentUploader";

interface IdeaSectionProps {
  pillar: Pillar;
  pillars: Pillar[];
  searchQuery: string;
  onNewIdeaClick: () => void;
  onDeleteContent: (contentId: string) => void;
  onMoveContent: (toPillarId: string, contentId: string) => void;
  onEditContent: (contentId: string) => void;
  onReorderContent: (newItems: ContentItem[]) => void;
  editingContent: ContentItem | null;
  isEditing: boolean;
  onContentUpdated: (pillarId: string, content: ContentItem) => void;
  onCancelEdit: () => void;
  onContentAdded: (pillarId: string, content: ContentItem) => void;
}

const IdeaSection = ({
  pillar,
  pillars,
  searchQuery,
  onNewIdeaClick,
  onDeleteContent,
  onMoveContent,
  onEditContent,
  onReorderContent,
  editingContent,
  isEditing,
  onContentUpdated,
  onCancelEdit,
  onContentAdded
}: IdeaSectionProps) => {
  return (
    <div className="space-y-4 pl-4 pr-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" /> 
          Develop Your Ideas
        </h2>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <ContentUploader
              pillarId={pillar.id}
              onContentAdded={onContentAdded}
              onContentUpdated={onContentUpdated}
              contentToEdit={editingContent}
              isEditMode={true}
              onCancelEdit={onCancelEdit}
            />
          ) : (
            <Button 
              variant="default" 
              size="sm"
              className="bg-[#8B6B4E] hover:bg-[#7A5C3F]"
              onClick={onNewIdeaClick}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add New Idea
            </Button>
          )}
        </div>
      </div>
      <ContentPillar
        pillar={pillar}
        pillars={pillars}
        onDeleteContent={onDeleteContent}
        onMoveContent={onMoveContent}
        onEditContent={onEditContent}
        searchQuery={searchQuery}
        onReorderContent={onReorderContent}
      />
    </div>
  );
};

export default IdeaSection;
