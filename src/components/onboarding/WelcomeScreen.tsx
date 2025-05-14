
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Confetti, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  userData: {
    name: string;
    connectedAccounts: string[];
  };
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userData, onComplete }) => {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">Let's get you into Hey Megan!</h1>
        <p className="text-gray-500 mt-2">
          Everything is set up and ready for you, {userData.name}
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="font-medium mb-2">Your account setup is complete:</p>
        <ul className="space-y-2 text-left">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Account created</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Payment method added</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Preferences configured</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>{userData.connectedAccounts.length} social accounts connected</span>
          </li>
        </ul>
      </div>
      
      <div>
        <Button onClick={onComplete} size="lg" className="px-8">
          Let's go!
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          Your 7-day free trial has begun
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
