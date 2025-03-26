
import { ReactNode, useState } from "react";
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

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
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
  const [isScriptExpanded, setIsScriptExpanded] = useState(true);

  const handleScriptCollapseChange = (isOpen: boolean) => {
    setIsScriptExpanded(isOpen);
  };

  return (
    <ScrollArea className="h-[calc(95vh-140px)] pr-4" style={{ overflowY: 'auto', touchAction: 'pan-y' }}>
      <motion.div 
        className="grid gap-5 py-4 pr-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          whileHover={{ scale: 1.01 }} 
          transition={{ duration: 0.2 }}
          variants={itemVariants}
          layout
        >
          <BucketSelectionSection 
            bucketId={bucketId} 
            onBucketChange={onBucketChange} 
            pillarId={pillarId} 
          />
        </motion.div>
        
        <motion.div 
          className="bg-purple-50 rounded-lg p-4 mx-2 border border-purple-100 shadow-sm"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }} 
          transition={{ duration: 0.2 }}
          layout
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
        
        <motion.div 
          whileHover={{ scale: 1.01 }} 
          transition={{ duration: 0.2 }}
          variants={itemVariants}
          layout
          className="mx-2"
        >
          <TitleInputSection title={title} onTitleChange={onTitleChange} />
        </motion.div>
        
        <motion.div 
          className={`grid grid-cols-1 ${isScriptExpanded ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-5 mx-2`}
          variants={itemVariants}
          layout
        >
          <motion.div 
            className={isScriptExpanded ? "lg:col-span-2 space-y-4" : ""}
            whileHover={{ scale: 1.01 }} 
            transition={{ duration: 0.2 }}
            layout
          >
            <ScriptInputSection 
              scriptText={scriptText} 
              onScriptTextChange={onScriptTextChange} 
              onCollapseChange={handleScriptCollapseChange}
            />
          </motion.div>
          
          {isScriptExpanded ? (
            <div className="space-y-5">
              <motion.div
                whileHover={{ scale: 1.01 }} 
                transition={{ duration: 0.2 }}
                layout
              >
                <ShootDetailsSection shootDetails={shootDetails} onShootDetailsChange={onShootDetailsChange} />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.01 }} 
                transition={{ duration: 0.2 }}
                layout
              >
                <VisualNotesSection visualNotes={visualNotes} onVisualNotesChange={onVisualNotesChange} />
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <motion.div
                whileHover={{ scale: 1.01 }} 
                transition={{ duration: 0.2 }}
                layout
              >
                <ShootDetailsSection shootDetails={shootDetails} onShootDetailsChange={onShootDetailsChange} />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.01 }} 
                transition={{ duration: 0.2 }}
                layout
              >
                <VisualNotesSection visualNotes={visualNotes} onVisualNotesChange={onVisualNotesChange} />
              </motion.div>
            </div>
          )}
        </motion.div>
        
        <motion.div 
          className="bg-amber-50 rounded-lg p-4 mx-2 border border-amber-100 shadow-sm"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }} 
          transition={{ duration: 0.2 }}
          layout
        >
          <CaptionInputSection captionText={captionText} onCaptionTextChange={onCaptionTextChange} />
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mx-2"
          variants={itemVariants}
          layout
        >
          <motion.div 
            className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm"
            whileHover={{ scale: 1.01 }} 
            transition={{ duration: 0.2 }}
          >
            <PlatformsSection
              platforms={platforms}
              currentPlatform={currentPlatform}
              onCurrentPlatformChange={onCurrentPlatformChange}
              onAddPlatform={onAddPlatform}
              onRemovePlatform={onRemovePlatform}
            />
          </motion.div>
          
          <motion.div 
            className="bg-green-50 rounded-lg p-4 border border-green-100 shadow-sm"
            whileHover={{ scale: 1.01 }} 
            transition={{ duration: 0.2 }}
          >
            <TagsSection
              tags={tags}
              currentTag={currentTag}
              onCurrentTagChange={onCurrentTagChange}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
            />
          </motion.div>
        </motion.div>
        
        {children}
      </motion.div>
    </ScrollArea>
  );
};

export default DialogContent;
