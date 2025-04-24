
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { HOOK_TONES } from "@/utils/hookGenerationUtils";

interface ToneSelectorProps {
  selectedTone: string;
  onToneChange: (tone: string) => void;
}

const ToneSelector = ({ selectedTone, onToneChange }: ToneSelectorProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-base">Select the tone for your hook</Label>
      <RadioGroup
        value={selectedTone}
        onValueChange={onToneChange}
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
  );
};

export default ToneSelector;

