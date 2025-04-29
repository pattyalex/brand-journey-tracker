
import { showMaxAgeRangesSelectedToast } from "@/hooks/use-toast";

// Example function that handles age range selection
function handleAgeRangeSelection(selectedRanges: string[]) {
  if (selectedRanges.length > 3) {
    // Show toast notification instead of static text
    showMaxAgeRangesSelectedToast();
    return false;
  }
  
  // Continue with your logic for valid selections
  return true;
}
