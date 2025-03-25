
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
import { motion } from "framer-motion";

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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

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
      <motion.div 
        className="grid gap-5 py-4 pr-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title and bucket row */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          variants={itemVariants}
        >
          <div>
            <TitleInputSection title={title} onTitleChange={onTitleChange} />
          </div>
          
          <div>
            <BucketSelectionSection 
              bucketId={bucketId} 
              onBucketChange={onBucketChange} 
              pillarId={pillarId} 
            />
          </div>
        </motion.div>
        
        {/* Inspiration section with new styling */}
        <motion.div 
          className="bg-purple-50 rounded-lg p-4 border border-purple-100 shadow-sm"
          variants={itemVariants}
        >
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
        </motion.div>
        
        {/* Script and visual sections */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          variants={itemVariants}
        >
          {/* Script section (takes 2/3 on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <ScriptInputSection scriptText={scriptText} onScriptTextChange={onScriptTextChange} />
          </div>
          
          {/* Visual notes and shoot details (takes 1/3 on large screens) */}
          <div className="space-y-5">
            <ShootDetailsSection shootDetails={shootDetails} onShootDetailsChange={onShootDetailsChange} />
            <VisualNotesSection visualNotes={visualNotes} onVisualNotesChange={onVisualNotesChange} />
          </div>
        </motion.div>
        
        {/* Caption section */}
        <motion.div 
          className="bg-amber-50 rounded-lg p-4 border border-amber-100 shadow-sm"
          variants={itemVariants}
        >
          <CaptionInputSection captionText={captionText} onCaptionTextChange={onCaptionTextChange} />
        </motion.div>
        
        {/* Platforms and tags in two columns */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          variants={itemVariants}
        >
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
        </motion.div>
        
        {children}
      </motion.div>
    </ScrollArea>
  );
};

export default DialogContent;
