
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Video } from "lucide-react";

const ContentDraftsSection = () => {
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [captions, setCaptions] = useState("");

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Video className="h-5 w-5" />
          Content Drafts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter content title..."
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Script</label>
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Write your script here..."
            className="min-h-[100px]"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Captions</label>
          <Textarea
            value={captions}
            onChange={(e) => setCaptions(e.target.value)}
            placeholder="Add your captions..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentDraftsSection;
