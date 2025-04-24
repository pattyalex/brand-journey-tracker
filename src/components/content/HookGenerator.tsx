
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sparkles, Check, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const generateHooksByTone = (tone: string, context: string): string[] => {
    const contextWords = context.toLowerCase().split(' ');
    const hasKeyword = (word: string) => contextWords.some(w => w.includes(word));
    
    const toneHooks: { [key: string]: string[] } = {
      "bold": [
        "STOP scrolling! Here's what nobody tells you about...",
        "I bet you've NEVER seen this before...",
        "The ONE thing they don't want you to know...",
        "Warning: This will change everything you thought about...",
        "Breaking: The industry-shocking truth about..."
      ],
      "classy": [
        "Discover the art of perfecting your approach to...",
        "Elevate your experience with these timeless strategies...",
        "The sophisticated guide to mastering...",
        "Unveiling the refined method behind...",
        "A curated approach to excellence in..."
      ],
      "fun": [
        "OMG! You won't believe what happens when you...",
        "This hack literally changed my life in 24 hours...",
        "Wait for it... The most entertaining way to...",
        "Plot twist: The fun secret to mastering...",
        "You're doing it wrong! Here's the fun way to..."
      ],
      "emotional": [
        "I never thought I'd share this journey, but...",
        "The moment that changed everything for me...",
        "When everything seemed impossible, this one thing saved me...",
        "My heart broke when I realized this about...",
        "The touching truth behind my success with..."
      ],
      "confident": [
        "Here's exactly how I achieved results in just one week...",
        "The proven 3-step formula that guarantees success...",
        "Why 90% of people fail at this (and how to be in the top 10%)...",
        "Master this skill in 5 simple steps...",
        "The confident approach to conquering..."
      ]
    };

    const additionalHooks: { [key: string]: string[] } = {
      "bold": [
        "The shocking truth about...",
        "You won't believe what happens when...",
        "The secret they're hiding from you about...",
        "This changes everything about...",
        "The revolutionary approach to..."
      ],
      "classy": [
        "The refined approach to...",
        "Master the art of...",
        "The elegant solution for...",
        "Transform your understanding of...",
        "The distinguished method for..."
      ],
      "fun": [
        "The most fun way to...",
        "Try this crazy hack for...",
        "The unexpected joy of...",
        "This silly trick actually works for...",
        "The playful secret to..."
      ],
      "emotional": [
        "What no one tells you about the struggle with...",
        "Finding hope when dealing with...",
        "The emotional journey to...",
        "How I found peace with...",
        "The healing truth about..."
      ],
      "confident": [
        "The foolproof method for...",
        "Master this in 7 days...",
        "The expert's guide to...",
        "Never fail again at...",
        "The winning strategy for..."
      ]
    };
    
    return toneHooks[tone] || toneHooks["bold"];
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    
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

  const handleLoadMore = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      try {
        const additionalHooks = generateHooksByTone(selectedTone, context);
        setGeneratedHooks(prev => [...prev, ...additionalHooks]);
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
                Generate Hooks
              </>
            )}
          </Button>
        </div>
      </div>
      
      {generatedHooks.length > 0 && (
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-lg font-medium mb-4">Select a hook:</h3>
          <div className="flex-1 border rounded-md overflow-hidden">
            <ScrollArea 
              className="h-full"
              scrollHideDelay={0}
              style={{ 
                position: "relative", 
                height: "100%",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div className="grid gap-3 p-4 pr-6">
                {generatedHooks.map((hook, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectHook(hook)}
                    className="p-3 border rounded-md cursor-pointer hover:border-primary hover:bg-accent/30 transition-colors flex justify-between items-center"
                  >
                    <div className="text-sm">{hook}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectHook(hook);
                      }}
                      className="opacity-70 hover:opacity-100"
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Select hook</span>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
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
