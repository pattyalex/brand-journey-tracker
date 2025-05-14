
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";

interface UserOnboardingQuestionsProps {
  userData: {
    mainGoal: string;
  };
  updateUserData: (data: Partial<{ mainGoal: string }>) => void;
  onNext: () => void;
  onBack: () => void;
}

const UserOnboardingQuestions: React.FC<UserOnboardingQuestionsProps> = ({ 
  userData, 
  updateUserData, 
  onNext, 
  onBack 
}) => {
  const [otherGoal, setOtherGoal] = React.useState("");
  const [showOtherInput, setShowOtherInput] = React.useState(false);

  const handleGoalChange = (value: string) => {
    if (value === "other") {
      setShowOtherInput(true);
      updateUserData({ mainGoal: otherGoal });
    } else {
      setShowOtherInput(false);
      updateUserData({ mainGoal: value });
    }
  };

  const handleOtherGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOtherGoal(value);
    updateUserData({ mainGoal: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">We'd like to get to know you</h1>
        <p className="text-gray-500 mt-2">
          This helps us personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">What's your most important goal?</Label>
          
          <RadioGroup 
            value={showOtherInput ? "other" : userData.mainGoal}
            onValueChange={handleGoalChange}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
              <RadioGroupItem value="organize" id="organize" />
              <Label htmlFor="organize" className="flex-1 cursor-pointer">
                To organize my content creation work
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
              <RadioGroupItem value="guidance" id="guidance" />
              <Label htmlFor="guidance" className="flex-1 cursor-pointer">
                To get guidance on content ideas
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
              <RadioGroupItem value="performance" id="performance" />
              <Label htmlFor="performance" className="flex-1 cursor-pointer">
                To track and improve my social performance
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="flex-1 cursor-pointer">
                Other
              </Label>
            </div>
          </RadioGroup>
          
          {showOtherInput && (
            <div className="mt-3 pl-6">
              <Input
                value={otherGoal}
                onChange={handleOtherGoalChange}
                placeholder="Tell us your goal..."
                className="w-full"
              />
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            disabled={!userData.mainGoal}
            className="w-full"
          >
            Continue
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserOnboardingQuestions;
