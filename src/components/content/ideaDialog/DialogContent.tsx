
import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TitleInputSection from "./TitleInputSection";
import BucketSelectionSection from "./BucketSelectionSection";
import ScriptInputSection from "./ScriptInputSection";
import VisualNotesSection from "./VisualNotesSection";
import ShootDetailsSection from "./ShootDetailsSection";
import CaptionInputSection from "./CaptionInputSection";
import PlatformsSection from "./PlatformsSection";
import TagsSection from "./TagsSection";
import InspirationSection from "./InspirationSection";

interface DialogContentProps {
  title: string;
  onTitleChange: (value: string) => void;
  bucketId: string;
  onBucketChange: (value: string) => void;
  pillarId: string;
  format: string;
  onFormatChange: (value: string) => void;
  scriptText: string;
  onScriptTextChange: (value: string) => void;
  visualNotes: string;
  onVisualNotesChange: (value: string) => void;
  shootDetails: string;
  onShootDetailsChange: (value: string) => void;
  captionText: string;
  onCaptionTextChange: (value: string) => void;
  platforms: string[];
  currentPlatform: string;
  onCurrentPlatformChange: (value: string) => void;
  onAddPlatform: () => void;
  onRemovePlatform: (platform: string) => void;
  tags: string[];
  currentTag: string;
  onCurrentTagChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  inspirationText?: string;
  onInspirationTextChange?: (value: string) => void;
  inspirationLinks?: string[];
  onAddInspirationLink?: (link: string) => void;
  onRemoveInspirationLink?: (index: number) => void;
  inspirationImages?: string[];
  onAddInspirationImage?: (image: string) => void;
  onRemoveInspirationImage?: (index: number) => void;
  children?: ReactNode;
}

const DialogContent = ({
  title,
  onTitleChange,
  bucketId,
  onBucketChange,
  pillarId,
  format,
  onFormatChange,
  scriptText,
  onScriptTextChange,
  visualNotes,
  onVisualNotesChange,
  shootDetails,
  onShootDetailsChange,
  captionText,
  onCaptionTextChange,
  platforms,
  currentPlatform,
  onCurrentPlatformChange,
  onAddPlatform,
  onRemovePlatform,
  tags,
  currentTag,
  onCurrentTagChange,
  onAddTag,
  onRemoveTag,
  inspirationText = "",
  onInspirationTextChange = () => {},
  inspirationLinks = [],
  onAddInspirationLink = () => {},
  onRemoveInspirationLink = () => {},
  inspirationImages = [],
  onAddInspirationImage = () => {},
  onRemoveInspirationImage = () => {},
  children,
}: DialogContentProps) => {
  return (
    <ScrollArea className="h-[calc(95vh-140px)] pr-4" style={{ overflowY: 'auto', touchAction: 'pan-y' }}>
      <div className="grid gap-5 py-4 pr-2">
        <div className="space-y-5">
          <TitleInputSection title={title} onTitleChange={onTitleChange} />
        </div>
        
        <div className="space-y-5 pt-1">
          <BucketSelectionSection 
            bucketId={bucketId} 
            onBucketChange={onBucketChange} 
            pillarId={pillarId} 
          />
          
          <InspirationSection
            inspirationText={inspirationText}
            onInspirationTextChange={onInspirationTextChange}
            inspirationLinks={inspirationLinks}
            onAddInspirationLink={onAddInspirationLink}
            onRemoveInspirationLink={onRemoveInspirationLink}
            inspirationImages={inspirationImages}
            onAddInspirationImage={onAddInspirationImage}
            onRemoveInspirationImage={onRemoveInspirationImage}
          />
        </div>
        
        {/* Adjusted grid columns - script now takes 60% (3/5) and visual notes/shoot details 40% (2/5) */}
        <div className="grid grid-cols-5 gap-5 pt-4">
          <div className="col-span-3 space-y-5">
            <ScriptInputSection scriptText={scriptText} onScriptTextChange={onScriptTextChange} />
          </div>
          
          <div className="col-span-2 space-y-5">
            <VisualNotesSection visualNotes={visualNotes} onVisualNotesChange={onVisualNotesChange} />
            <ShootDetailsSection shootDetails={shootDetails} onShootDetailsChange={onShootDetailsChange} />
          </div>
        </div>
        
        <div className="space-y-5 pt-1">
          <CaptionInputSection captionText={captionText} onCaptionTextChange={onCaptionTextChange} />
        </div>
        
        <div className="space-y-5 pt-1">
          <PlatformsSection
            platforms={platforms}
            currentPlatform={currentPlatform}
            onCurrentPlatformChange={onCurrentPlatformChange}
            onAddPlatform={onAddPlatform}
            onRemovePlatform={onRemovePlatform}
          />
          
          <TagsSection
            tags={tags}
            currentTag={currentTag}
            onCurrentTagChange={onCurrentTagChange}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
          />
        </div>
        
        {children}
      </div>
    </ScrollArea>
  );
};

export default DialogContent;
