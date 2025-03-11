
import { useState } from "react";
import { RecurrencePattern, RecurrenceRule } from "@/utils/recurringEvents";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Repeat } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format, parseISO, addMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface RecurringEventOptionsProps {
  recurrenceRule?: RecurrenceRule;
  onChange: (rule: RecurrenceRule | undefined) => void;
  startDate: string; // ISO string format YYYY-MM-DD
}

export const RecurringEventOptions = ({
  recurrenceRule = { pattern: "none" },
  onChange,
  startDate,
}: RecurringEventOptionsProps) => {
  const [isEndDateMode, setIsEndDateMode] = useState(
    !!recurrenceRule.endDate && !recurrenceRule.occurrences
  );
  
  const handlePatternChange = (pattern: RecurrencePattern) => {
    if (pattern === "none") {
      onChange(undefined);
    } else {
      onChange({
        ...recurrenceRule,
        pattern,
      });
    }
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    onChange({
      ...recurrenceRule,
      endDate: format(date, "yyyy-MM-dd"),
      occurrences: undefined,
    });
  };
  
  const handleOccurrencesChange = (occurrences: string) => {
    const occurrencesNumber = parseInt(occurrences);
    if (isNaN(occurrencesNumber) || occurrencesNumber <= 0) return;
    
    onChange({
      ...recurrenceRule,
      occurrences: occurrencesNumber,
      endDate: undefined,
    });
  };
  
  const toggleEndMode = () => {
    setIsEndDateMode(!isEndDateMode);
    
    if (isEndDateMode) {
      // Switch to occurrences
      onChange({
        ...recurrenceRule,
        occurrences: 10,
        endDate: undefined,
      });
    } else {
      // Switch to end date
      onChange({
        ...recurrenceRule,
        endDate: format(addMonths(parseISO(startDate), 3), "yyyy-MM-dd"),
        occurrences: undefined,
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Repeat className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="recurrence-pattern">Repeat</Label>
      </div>
      
      <Select
        value={recurrenceRule?.pattern || "none"}
        onValueChange={(value: RecurrencePattern) => handlePatternChange(value)}
      >
        <SelectTrigger id="recurrence-pattern" className="w-full">
          <SelectValue placeholder="Does not repeat" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Does not repeat</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>
      
      {recurrenceRule?.pattern && recurrenceRule.pattern !== "none" && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Label>Ends</Label>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={toggleEndMode}
              className="h-7 text-xs"
            >
              {isEndDateMode ? "Switch to number of occurrences" : "Switch to end date"}
            </Button>
          </div>
          
          {isEndDateMode ? (
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !recurrenceRule.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {recurrenceRule.endDate ? (
                      format(parseISO(recurrenceRule.endDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={recurrenceRule.endDate ? parseISO(recurrenceRule.endDate) : undefined}
                    onSelect={handleEndDateChange}
                    disabled={(date) => date < parseISO(startDate)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Label htmlFor="occurrences" className="w-auto">After</Label>
              <Input
                id="occurrences"
                type="number"
                min="1"
                value={recurrenceRule.occurrences || "10"}
                onChange={(e) => handleOccurrencesChange(e.target.value)}
                className="w-20 h-8"
              />
              <span className="text-sm">occurrences</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurringEventOptions;
