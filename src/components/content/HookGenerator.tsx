
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateHooks } from "@/utils/hookGenerationUtils";
import HooksList from "./hooks/HooksList";

interface HookGeneratorProps {
  onSelectHook: (hook: string) => void;
}

const HookGenerator = ({ onSelectHook }: HookGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState("");
  const [hooks, setHooks] = useState<string[]>([]);

  const handleGenerateHooks = async () => {
    try {
      setIsGenerating(true);
      const generatedHooks = await generateHooks({ keywords, content, target });
      setHooks(generatedHooks);
    } catch (error) {
      console.error("Failed to generate hooks:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHook = (hook: string) => {
    console.log("HookGenerator - Hook selected:", hook);
    onSelectHook(hook);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="keywords">Keywords (optional)</Label>
        <Input
          id="keywords"
          placeholder="Enter keywords related to your content"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="content">Content Description (optional)</Label>
        <Textarea
          id="content"
          placeholder="Describe what your content is about"
          className="min-h-20"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="target">Target Audience (optional)</Label>
        <Input
          id="target"
          placeholder="Who is your content for?"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </div>
      
      <Button 
        onClick={handleGenerateHooks}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? "Generating..." : "Generate Hooks"}
      </Button>
      
      {hooks.length > 0 && (
        <div className="mt-6">
          <Label>Select a hook</Label>
          <div className="mt-2">
            <HooksList 
              hooks={hooks} 
              onSelectHook={handleSelectHook} 
              onGenerateMore={handleGenerateHooks}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HookGenerator;
