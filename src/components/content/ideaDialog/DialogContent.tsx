
import { ReactNode, useState, useEffect } from "react";
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
import PillarSelector from "./PillarSelector";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Pillar } from "@/pages/BankOfContent";

interface DialogContentProps {
  title: string;
  onTitleChange: (value: string) => void;
  bucketId: string;
  onBucketChange: (value: string) => void;
  pillarId: string;
  onPillarChange?: (value: string) => void;
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
  onPillarChange = () => {},
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
  const [pillars, setPillars] = useState<Pillar[]>([
    { id: "1", name: "Pillar 1", content: [] },
    { id: "2", name: "Pillar 2", content: [] },
    { id: "3", name: "Pillar 3", content: [] }
  ]);

  useEffect(() => {
    try {
      const savedPillars = localStorage.getItem("pillars");
      if (savedPillars) {
        setPillars(JSON.parse(savedPillars));
      }
    } catch (error) {
      console.error("Error loading pillars:", error);
    }
  }, []);

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
        <LayoutGroup>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-2"
            variants={itemVariants}
            layout
          >
            {/* Destination Pillar now comes first */}
            <motion.div
              className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <PillarSelector 
                pillarId={pillarId} 
                onPillarChange={onPillarChange} 
                pillars={pillars}
              />
            </motion.div>
            
            {/* Content Format now comes second */}
            <motion.div 
              whileHover={{ scale: 1.01 }} 
              transition={{ duration: 0.2 }}
              layout
            >
              <BucketSelectionSection 
                bucketId={bucketId} 
                onBucketChange={onBucketChange} 
                pillarId={pillarId} 
              />
            </motion.div>
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
            transition={{ 
              layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.3 }
            }}
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
            
            <AnimatePresence mode="wait">
              {isScriptExpanded ? (
                <motion.div 
                  className="space-y-5 h-full"
                  layout
                  transition={{ 
                    layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.3 }
                  }}
                  key="expanded"
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }} 
                    transition={{ duration: 0.2 }}
                    layout
                    className="h-[calc(50%-0.625rem)]"
                  >
                    <ShootDetailsSection shootDetails={shootDetails} onShootDetailsChange={onShootDetailsChange} />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.01 }} 
                    transition={{ duration: 0.2 }}
                    layout
                    className="h-[calc(50%-0.625rem)]"
                  >
                    <VisualNotesSection visualNotes={visualNotes} onVisualNotesChange={onVisualNotesChange} />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4"
                  layout
                  transition={{ 
                    layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.3 }
                  }}
                  initial={{ opacity: 0.8, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key="collapsed"
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }} 
                    transition={{ duration: 0.2 }}
                    layout
                    className="h-full"
                  >
                    <ShootDetailsSection shootDetails={shootDetails} onShootDetailsChange={onShootDetailsChange} />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.01 }} 
                    transition={{ duration: 0.2 }}
                    layout
                    className="h-full"
                  >
                    <VisualNotesSection visualNotes={visualNotes} onVisualNotesChange={onVisualNotesChange} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
        </LayoutGroup>
      </motion.div>
    </ScrollArea>
  );
};

export default DialogContent;
