
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Pillar } from '@/pages/BankOfContent';

interface IdeaSectionProps {
  pillar: Pillar;
  pillars: Pillar[];
  searchQuery: string;
  onNewIdeaClick: () => void;
  onDeleteContent: (contentId: string) => void;
  onMoveContent: (toPillarId: string, contentId: string) => void;
  onEditContent: (contentId: string) => void;
  onReorderContent: (newItems: any[]) => void;
  editingContent: any | null;
  isEditing: boolean;
  onContentUpdated: (pillarId: string, updatedContent: any) => void;
  onCancelEdit: () => void;
  onContentAdded: (pillarId: string, content: any) => void;
  onAddToBucket: (formatType: string) => void;
}

const IdeaSection: React.FC<IdeaSectionProps> = ({
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
  onContentAdded,
  onAddToBucket
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold flex items-center">
        <Lightbulb className="h-5 w-5 mr-2" /> 
        {pillar.name}
      </h2>
      <h3 className="text-lg text-muted-foreground ml-8">Content Bank</h3>
    </div>
  );
};

export default IdeaSection;
