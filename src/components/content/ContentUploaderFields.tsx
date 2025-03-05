
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TagsInput from "./TagsInput";
import PlatformsInput from "./PlatformsInput";
import DateSchedulePicker from "./DateSchedulePicker";

interface ContentUploaderFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  textContent: string;
  setTextContent: (value: string) => void;
  formatText: string;
  setFormatText: (value: string) => void;
  shootDetails: string;
  setShootDetails: (value: string) => void;
  captionText: string;
  setCaptionText: (value: string) => void;
  tagsList: string[];
  currentTag: string;
  setCurrentTag: (value: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  platformsList: string[];
  currentPlatform: string;
  setCurrentPlatform: (value: string) => void;
  handleAddPlatform: () => void;
  handleRemovePlatform: (platform: string) => void;
  scheduledDate?: Date;
  setScheduledDate?: (date: Date | undefined) => void;
}

const ContentUploaderFields = ({
  title,
  setTitle,
  textContent,
  setTextContent,
  formatText,
  setFormatText,
  shootDetails,
  setShootDetails,
  captionText,
  setCaptionText,
  tagsList,
  currentTag,
  setCurrentTag,
  handleAddTag,
  handleRemoveTag,
  platformsList,
  currentPlatform,
  setCurrentPlatform,
  handleAddPlatform,
  handleRemovePlatform,
  scheduledDate,
  setScheduledDate
}: ContentUploaderFieldsProps) => {
  return (
    <div className="grid gap-4 py-4 pr-6">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a catchy hook for your idea..."
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="content">Script</Label>
        <Textarea
          id="content"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Develop your script here..."
          rows={8}
          className="resize-none"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="format">Format</Label>
        <Textarea
          id="format"
          value={formatText}
          onChange={(e) => setFormatText(e.target.value)}
          placeholder="Describe how you want to present your script (e.g., POV skit, educational, storytelling, aesthetic montage)..."
          className="resize-y h-20"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="shootDetails">Shoot Details</Label>
        <Textarea
          id="shootDetails"
          value={shootDetails}
          onChange={(e) => setShootDetails(e.target.value)}
          placeholder="Enter details about the shoot, such as location, outfits, props needed..."
          className="resize-y h-20"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          value={captionText}
          onChange={(e) => setCaptionText(e.target.value)}
          placeholder="Draft a caption for your content when posting to social media platforms..."
          className="resize-y h-20"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="platforms">Platforms</Label>
        <PlatformsInput
          platforms={platformsList}
          currentPlatform={currentPlatform}
          onPlatformChange={setCurrentPlatform}
          onAddPlatform={handleAddPlatform}
          onRemovePlatform={handleRemovePlatform}
          placeholder="Where do you want to post this content?"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="tags">Tags</Label>
        <TagsInput
          tags={tagsList}
          currentTag={currentTag}
          onTagChange={setCurrentTag}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          placeholder="Add tags (e.g., To Film, To Edit, To Post)"
        />
      </div>
      
      {setScheduledDate && (
        <div className="grid gap-2">
          <Label htmlFor="scheduledDate">Schedule to Calendar</Label>
          <DateSchedulePicker 
            date={scheduledDate} 
            onDateChange={setScheduledDate}
            label=""
          />
        </div>
      )}
    </div>
  );
};

export default ContentUploaderFields;
