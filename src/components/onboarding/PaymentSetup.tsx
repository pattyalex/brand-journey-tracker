
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CardElement } from "@stripe/react-stripe-js";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";

// Note: You'll need to install @stripe/react-stripe-js and @stripe/stripe-js
// This is a placeholder implementation

interface PaymentSetupProps {
  userData: {
    paymentMethod: string;
  };
  updateUserData: (data: Partial<{ paymentMethod: string }>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PaymentSetup: React.FC<PaymentSetupProps> = ({ userData, updateUserData, onNext, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState("");
  
  // This would be replaced with actual Stripe implementation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onNext();
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Enter your billing information</h1>
        <p className="text-gray-500 mt-2">
          Your 7-day free trial starts today
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <RadioGroup 
            value={userData.paymentMethod}
            onValueChange={(value) => updateUserData({ paymentMethod: value })}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center space-x-2 border rounded-md p-4">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Monthly billing</p>
                  <p className="text-sm text-gray-500">$17/month</p>
                </div>
              </Label>
              <span className="text-lg font-bold">$17</span>
            </div>
          </RadioGroup>
          
          <p className="text-sm text-gray-500 italic">
            You won't be charged today. After 7 days, your trial will convert into a paid subscription.
          </p>
        </div>
        
        <div className="space-y-4 p-4 border rounded-md bg-gray-50">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Card Information</Label>
            <div className="flex items-center space-x-1">
              <Lock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-400">Secure payment</span>
            </div>
          </div>
          
          {/* This is a placeholder - in a real app, you'd use Stripe's CardElement */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input 
                id="cardNumber" 
                placeholder="1234 5678 9012 3456"
                className="placeholder:text-gray-400"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input 
                  id="expiry" 
                  placeholder="MM/YY"
                  className="placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input 
                  id="cvc" 
                  placeholder="123"
                  className="placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
          
          {cardError && (
            <p className="text-sm text-red-500">{cardError}</p>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button type="submit" disabled={isProcessing} className="w-full">
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Add payment method
              </>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onBack}
            className="w-full"
            disabled={isProcessing}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentSetup;
