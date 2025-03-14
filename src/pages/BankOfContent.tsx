import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";
import ContentSearchModal from "@/components/content/ContentSearchModal";
import PillarTabs from "@/components/content/PillarTabs";
import WritingSpace from "@/components/content/WritingSpace";
import IdeaSection from "@/components/content/IdeaSection";
import IdeaCreationDialog from "@/components/content/IdeaCreationDialog";
import ContentTypeBuckets from "@/components/content/ContentTypeBuckets";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export type Pillar = {
  id: string;
  name: string;
  content: ContentItem[];
  writingSpace?: string;
  onUpdateWritingSpace?: (pillarId: string, text: string) => void;
};

const BankOfContent = () => {
  const [pillars, setPillars] = useState<Pillar[]>([
    { id: "1", name: "Pillar 1", content: [], writingSpace: "" },
    { id: "2", name: "Pillar 2", content: [], writingSpace: "" },
    { id: "3", name: "Pillar 3", content: [], writingSpace: "" },
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [writingText, setWritingText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [selectedText, setSelectedText] = useState("");
  const [developScriptText, setDevelopScriptText] = useState("");
  const [shootDetails, setShootDetails] = useState("");
  const [captionText, setCaptionText] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("text");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [showNewIdeaDialog, setShowNewIdeaDialog] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaTags, setNewIdeaTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [developIdeaMode, setDevelopIdeaMode] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [newBucketType, setNewBucketType] = useState("");

  // ... keep existing code (remaining component implementation)

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Idea Development</h1>
          <Button 
            variant="default" 
            size="default"
            className="bg-[#8B6B4E] hover:bg-[#7A5C3F]"
            onClick={openNewIdeaDialog}
          >
            <FileText className="h-4 w-4 mr-2" />
            Add New Idea
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <PillarTabs 
            pillars={pillars}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddPillar={addPillar}
            onRenamePillar={renamePillar}
            onDeletePillar={deletePillar}
          />
          
          <ContentTypeBuckets 
            onAddIdea={handleAddToBucket} 
            pillarId={activeTab}
          />
          
          {pillars.map((pillar) => (
            <TabsContent key={pillar.id} value={pillar.id} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WritingSpace 
                  writingText={writingText}
                  onTextChange={updateWritingSpace}
                  onTextSelection={handleTextSelection}
                  onFormatText={handleFormatText}
                />
                
                <IdeaSection 
                  pillar={pillar}
                  pillars={pillars}
                  searchQuery={searchQuery}
                  onNewIdeaClick={openNewIdeaDialog}
                  onDeleteContent={(contentId) => deleteContent(pillar.id, contentId)}
                  onMoveContent={(toPillarId, contentId) => moveContent(pillar.id, toPillarId, contentId)}
                  onEditContent={(contentId) => editContent(pillar.id, contentId)}
                  onReorderContent={(newItems) => handleReorderContent(pillar.id, newItems)}
                  editingContent={editingContent}
                  isEditing={isEditing}
                  onContentUpdated={updateContent}
                  onCancelEdit={cancelEditing}
                  onContentAdded={addContentToPillar}
                  onAddToBucket={handleAddToBucket}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <ContentSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          content={allContent}
          pillars={pillars}
        />
        
        <IdeaCreationDialog
          open={showNewIdeaDialog}
          onOpenChange={setShowNewIdeaDialog}
          title={newIdeaTitle}
          onTitleChange={setNewIdeaTitle}
          scriptText={developScriptText || selectedText}
          onScriptTextChange={setDevelopScriptText}
          format={selectedFormat}
          onFormatChange={setSelectedFormat}
          shootDetails={shootDetails}
          onShootDetailsChange={setShootDetails}
          captionText={captionText}
          onCaptionTextChange={setCaptionText}
          platforms={selectedPlatforms}
          currentPlatform={currentPlatform}
          onCurrentPlatformChange={setCurrentPlatform}
          onAddPlatform={addPlatform}
          onRemovePlatform={removePlatform}
          tags={newIdeaTags}
          currentTag={currentTag}
          onCurrentTagChange={setCurrentTag}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          scheduledDate={scheduledDate}
          onScheduledDateChange={setScheduledDate}
          onSave={createNewIdeaFromSelection}
          onCancel={() => {
            setShowNewIdeaDialog(false);
            setDevelopIdeaMode(false);
            setScheduledDate(undefined);
            setNewBucketType("");
          }}
          isEditMode={developIdeaMode}
          dialogTitle={developIdeaMode ? "Develop Selected Idea" : (newBucketType ? 
            `Add to ${newBucketType.charAt(0).toUpperCase() + newBucketType.slice(1)} Bucket` : 
            "Create New Idea")}
        />
      </div>
    </Layout>
  );
};

export default BankOfContent;
