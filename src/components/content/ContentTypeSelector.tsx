
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ContentTypeOption = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

interface ContentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: ContentTypeOption[];
}

const ContentTypeSelector = ({
  value,
  onChange,
  options
}: ContentTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-input transition-all",
            "hover:border-primary/50 hover:bg-accent/50",
            value === option.value ? "bg-accent border-primary ring-1 ring-primary" : "bg-background"
          )}
        >
          <div className="w-8 h-8 flex items-center justify-center text-primary">
            {option.icon}
          </div>
          <span className="text-sm font-medium">{option.label}</span>
          {value === option.value && (
            <div className="absolute top-2 right-2">
              <Check className="h-4 w-4 text-primary" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default ContentTypeSelector;
