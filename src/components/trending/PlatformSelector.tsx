
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const platforms = [
  { value: "all", label: "All Platforms" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "tiktok", label: "TikTok" },
  { value: "threads", label: "Threads" }
];

interface PlatformSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const PlatformSelector = ({ value, onValueChange }: PlatformSelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select Platform" />
      </SelectTrigger>
      <SelectContent>
        {platforms.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PlatformSelector;
