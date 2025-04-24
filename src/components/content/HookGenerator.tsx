
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

const HOOK_TONES = [
  {
    id: "bold",
    name: "Bold & Edgy",
    description: "Direct, provocative, and attention-grabbing"
  },
  {
    id: "classy",
    name: "Classy & Elegant",
    description: "Sophisticated, polished, and refined"
  },
  {
    id: "fun",
    name: "Fun & Playful",
    description: "Light-hearted, entertaining, and engaging"
  },
  {
    id: "emotional",
    name: "Emotional & Heartfelt",
    description: "Empathetic, genuine, and touching"
  },
  {
    id: "confident",
    name: "Confident & Persuasive",
    description: "Authoritative, convincing, and impactful"
  }
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
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {HOOK_TONES.map((tone) => (
            <div key={tone.id} className="flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent">
              <RadioGroupItem value={tone.id} id={tone.id} className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor={tone.id} className="text-base font-medium">
                  {tone.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {tone.description}
                </p>
              </div>
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
