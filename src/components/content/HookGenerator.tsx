
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ToneSelector from "./hooks/ToneSelector";
import HooksList from "./hooks/HooksList";
import { generateHooksByTone, generateAdditionalHooks } from "@/utils/hookGenerationUtils";

interface HookGeneratorProps {
  onSelectHook: (hook: string) => void;
}

const HookGenerator = ({ onSelectHook }: HookGeneratorProps) => {
  const [context, setContext] = useState("");
  const [selectedTone, setSelectedTone] = useState("bold");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHooks, setGeneratedHooks] = useState<string[]>([]);

  const handleGenerate = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      try {
        const hooks = generateHooksByTone(selectedTone);
        setGeneratedHooks(hooks);
        toast({
          title: "Hooks generated!",
          description: "Select one to use in your content."
        });
      } catch (error) {
        toast({
          title: "Failed to generate hooks",
          description: "Please try again with more context.",
          variant: "destructive"
        });
      } finally {
        setIsGenerating(false);
      }
    }, 1200);
  };

  const handleLoadMore = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      try {
        const moreHooks = generateAdditionalHooks(selectedTone);
        setGeneratedHooks(prev => [...prev, ...moreHooks]);
        toast({
          title: "More hooks generated!",
          description: "New options have been added below."
        });
      } catch (error) {
        toast({
          title: "Failed to generate more hooks",
          description: "Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsGenerating(false);
      }
    }, 1200);
  };

  const handleSelectHook = (hook: string) => {
    onSelectHook(hook);
    toast({
      title: "Hook selected!",
      description: "Your hook has been added to your content."
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex gap-6 flex-shrink-0">
        <div className="flex-1 space-y-4">
          <Label className="text-base text-left block">
            Provide some context about your content
          </Label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder='Enter details about your content. E.g. "This video is about morning routines for ambitious women..."'
            className="min-h-[240px] resize-none pl-0" 
          />
        </div>

        <div className="w-[200px] space-y-6">
          <ToneSelector 
            selectedTone={selectedTone}
            onToneChange={setSelectedTone}
          />

          <Button
            onClick={handleGenerate}
            disabled={!context.trim() || isGenerating}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              "Generating..."
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Hooks
              </>
            )}
          </Button>
        </div>
      </div>
      
      {generatedHooks.length > 0 && (
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-lg font-medium mb-4">Select a hook:</h3>
          <HooksList hooks={generatedHooks} onSelectHook={handleSelectHook} />
          <Button
            onClick={handleLoadMore}
            disabled={isGenerating}
            variant="outline"
            className="w-full mt-4"
          >
            {isGenerating ? (
              "Generating..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Load More Hooks
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default HookGenerator;

