
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sparkles, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const HOOK_TONES = [
  { id: "bold", name: "Bold & Edgy" },
  { id: "classy", name: "Classy & Elegant" },
  { id: "fun", name: "Fun & Playful" },
  { id: "emotional", name: "Emotional & Heartfelt" },
  { id: "confident", name: "Confident & Persuasive" }
];

interface HookGeneratorProps {
  onSelectHook: (hook: string) => void;
}

const HookGenerator = ({ onSelectHook }: HookGeneratorProps) => {
  const [context, setContext] = useState("");
  const [selectedTone, setSelectedTone] = useState("bold");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHooks, setGeneratedHooks] = useState<string[]>([]);

  // Mock hook generation based on tone and context
  const generateHooksByTone = (tone: string, context: string): string[] => {
    const contextWords = context.toLowerCase().split(' ');
    const hasKeyword = (word: string) => contextWords.some(w => w.includes(word));
    
    switch (tone) {
      case "bold":
        return [
          "STOP scrolling! Here's what nobody tells you about...",
          "I bet you've NEVER seen this before...",
          "The ONE thing they don't want you to know..."
        ];
      case "classy":
        return [
          "Discover the art of perfecting your approach to...",
          "Elevate your experience with these timeless strategies...",
          "The sophisticated guide to mastering..."
        ];
      case "fun":
        return [
          "OMG! You won't believe what happens when you...",
          "This hack literally changed my life in 24 hours...",
          "Wait for it... The most entertaining way to..."
        ];
      case "emotional":
        return [
          "I never thought I'd share this journey, but...",
          "The moment that changed everything for me...",
          "When everything seemed impossible, this one thing saved me..."
        ];
      case "confident":
        return [
          "Here's exactly how I achieved results in just one week...",
          "The proven 3-step formula that guarantees success...",
          "Why 90% of people fail at this (and how to be in the top 10%)..."
        ];
      default:
        return [
          "3 things you need to know about...",
          "Here's a quick tip that changed everything...",
          "The ultimate guide to getting started with..."
        ];
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        const hooks = generateHooksByTone(selectedTone, context);
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

  const handleSelectHook = (hook: string) => {
    onSelectHook(hook);
    toast({
      title: "Hook selected!",
      description: "Your hook has been added to your content."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
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
          <div className="space-y-4">
            <Label className="text-base">Select the tone for your hook</Label>
            <RadioGroup
              value={selectedTone}
              onValueChange={setSelectedTone}
              className="grid grid-cols-1 gap-2"
            >
              {HOOK_TONES.map((tone) => (
                <div 
                  key={tone.id} 
                  className="flex items-center space-x-2 p-1.5 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <RadioGroupItem value={tone.id} id={tone.id} />
                  <Label 
                    htmlFor={tone.id} 
                    className="text-xs font-medium cursor-pointer"
                  >
                    {tone.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

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
                Generate Hook
              </>
            )}
          </Button>
        </div>
      </div>
      
      {generatedHooks.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Select a hook:</h3>
          <div className="grid gap-3">
            {generatedHooks.map((hook, index) => (
              <div
                key={index}
                onClick={() => handleSelectHook(hook)}
                className="p-3 border rounded-md cursor-pointer hover:border-primary hover:bg-accent/30 transition-colors flex justify-between items-center"
              >
                <div className="text-sm">{hook}</div>
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  handleSelectHook(hook);
                }}>
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Select hook</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HookGenerator;
