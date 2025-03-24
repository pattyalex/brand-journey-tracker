
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
        {/* Title and bucket row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <TitleInputSection title={title} onTitleChange={onTitleChange} />
          </div>
          
          <div className="space-y-3">
            <BucketSelectionSection 
              bucketId={bucketId} 
              onBucketChange={onBucketChange} 
              pillarId={pillarId} 
            />
          </div>
        </div>
        
        {/* Inspiration section with new styling */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 shadow-sm">
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
        
        {/* Script and visual sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Script section (takes 2/3 on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <ScriptInputSection scriptText={scriptText} onScriptTextChange={onScriptTextChange} />
          </div>
          
          {/* Visual notes and shoot details (takes 1/3 on large screens) */}
          <div className="space-y-5">
            <ShootDetailsSection shootDetails={shootDetails} onShootDetailsChange={onShootDetailsChange} />
            <VisualNotesSection visualNotes={visualNotes} onVisualNotesChange={onVisualNotesChange} />
          </div>
        </div>
        
        {/* Caption section */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 shadow-sm">
          <CaptionInputSection captionText={captionText} onCaptionTextChange={onCaptionTextChange} />
        </div>
        
        {/* Platforms and tags in two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm">
            <PlatformsSection
              platforms={platforms}
              currentPlatform={currentPlatform}
              onCurrentPlatformChange={onCurrentPlatformChange}
              onAddPlatform={onAddPlatform}
              onRemovePlatform={onRemovePlatform}
            />
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100 shadow-sm">
            <TagsSection
              tags={tags}
              currentTag={currentTag}
              onCurrentTagChange={onCurrentTagChange}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
            />
          </div>
        </div>
        
        {children}
      </div>
    </ScrollArea>
  );
};

export default DialogContent;
