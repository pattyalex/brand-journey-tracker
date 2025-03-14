
import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TitleInputSection from "./TitleInputSection";
import BucketSelectionSection from "./BucketSelectionSection";
import ScriptInputSection from "./ScriptInputSection";
import ShootDetailsSection from "./ShootDetailsSection";
import CaptionInputSection from "./CaptionInputSection";
import PlatformsSection from "./PlatformsSection";
import TagsSection from "./TagsSection";
import SchedulingSection from "./SchedulingSection";
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
  scheduledDate?: Date;
  onScheduledDateChange?: (date: Date | undefined) => void;
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
  scheduledDate,
  onScheduledDateChange,
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
    <ScrollArea className="h-[calc(90vh-140px)] pr-4" style={{ overflowY: 'auto', touchAction: 'pan-y' }}>
      <div className="grid gap-6 py-4 pr-2">
        <TitleInputSection title={title} onTitleChange={onTitleChange} />
        
        <div className="h-1"></div>
        
        <BucketSelectionSection 
          bucketId={bucketId} 
          onBucketChange={onBucketChange} 
          pillarId={pillarId} 
        />
        
        <div className="h-8"></div>
        
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
        
        <div className="h-8"></div>
        
        <ScriptInputSection scriptText={scriptText} onScriptTextChange={onScriptTextChange} />
        
        <div className="h-4"></div>
        
        <ShootDetailsSection shootDetails={shootDetails} onShootDetailsChange={onShootDetailsChange} />
        
        <CaptionInputSection captionText={captionText} onCaptionTextChange={onCaptionTextChange} />
        
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
        
        <SchedulingSection scheduledDate={scheduledDate} onScheduledDateChange={onScheduledDateChange} />
        
        {children}
      </div>
    </ScrollArea>
  );
};

export default DialogContent;
