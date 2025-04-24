
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

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

  const handleGenerate = () => {
    setIsGenerating(true);
    // TODO: Integrate with Megan AI
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base">Select the tone for your hook</Label>
        <RadioGroup
          value={selectedTone}
          onValueChange={setSelectedTone}
          className="grid grid-cols-3 gap-2"
        >
          {HOOK_TONES.map((tone) => (
            <div 
              key={tone.id} 
              className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <RadioGroupItem value={tone.id} id={tone.id} />
              <Label 
                htmlFor={tone.id} 
                className="text-sm font-medium cursor-pointer"
              >
                {tone.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-base">
          Provide some context about your content
        </Label>
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Enter details about your content, target audience, key message, etc."
          className="min-h-[120px] resize-none"
        />
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
  );
};

export default HookGenerator;

