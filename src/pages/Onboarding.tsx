
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Instagram, Youtube, Linkedin, Twitter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    billingOption: 'monthly',
    goal: '',
    connectedPlatforms: [] as string[]
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 10;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasMinLength) return "Password must be at least 10 characters";
    if (!hasUppercase) return "Password must include an uppercase letter";
    if (!hasSpecialChar) return "Password must include a special character";
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setEmailError(validateEmail(value) ? '' : 'Please enter a valid email');
    }
    
    if (name === 'password') {
      setPasswordError(validatePassword(value));
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      goal: value
    });
  };

  const handleBillingOptionChange = (value: string) => {
    setFormData({
      ...formData,
      billingOption: value
    });
  };

  const handlePlatformToggle = (platform: string) => {
    const updatedPlatforms = formData.connectedPlatforms.includes(platform)
      ? formData.connectedPlatforms.filter(p => p !== platform)
      : [...formData.connectedPlatforms, platform];
      
    setFormData({
      ...formData,
      connectedPlatforms: updatedPlatforms
    });
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate step 1 fields
      if (!formData.name || !formData.email || !formData.password) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      if (emailError) {
        toast.error("Please enter a valid email address");
        return;
      }
      
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
    }
    
    if (step === 3) {
      // Validate step 3 - must select a goal
      if (!formData.goal) {
        toast.error("Please select your most important goal");
        return;
      }
    }
    
    if (step === 4) {
      // Validate step 4 - must connect at least 2 platforms
      if (formData.connectedPlatforms.length < 2) {
        toast.error("Please connect at least two social platforms");
        return;
      }
    }
    
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Complete onboarding and redirect to dashboard
      localStorage.setItem('onboardingComplete', 'true');
      localStorage.setItem('userProfile', JSON.stringify({
        name: formData.name,
        email: formData.email,
        connectedPlatforms: formData.connectedPlatforms
      }));
      navigate('/');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="Your name" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="you@example.com" 
                required 
              />
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleInputChange} 
                placeholder="Create a strong password" 
                required 
              />
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
              <p className="text-xs text-muted-foreground">
                Password must be at least 10 characters, include an uppercase letter and a special character
              </p>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border p-4 rounded-lg">
                <div>
                  <h3 className="font-medium">Monthly Billing</h3>
                  <p className="text-sm text-muted-foreground">$17 per month</p>
                </div>
                <RadioGroup 
                  value={formData.billingOption} 
                  onValueChange={handleBillingOptionChange}
                  className="flex"
                >
                  <RadioGroupItem value="monthly" id="monthly" />
                </RadioGroup>
              </div>
              <div className="border p-4 rounded-lg space-y-4">
                <h3 className="font-medium">Credit Card Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic">
                You won't be charged today. After 7 days, your trial will convert into a paid subscription.
              </p>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="font-medium">What's your most important goal?</h3>
            <RadioGroup 
              value={formData.goal} 
              onValueChange={handleRadioChange}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 border p-4 rounded-lg">
                <RadioGroupItem value="organize" id="organize" />
                <Label htmlFor="organize" className="flex-1 cursor-pointer">To organize my content creation work</Label>
              </div>
              <div className="flex items-center space-x-2 border p-4 rounded-lg">
                <RadioGroupItem value="guidance" id="guidance" />
                <Label htmlFor="guidance" className="flex-1 cursor-pointer">To get guidance on content ideas</Label>
              </div>
              <div className="flex items-center space-x-2 border p-4 rounded-lg">
                <RadioGroupItem value="track" id="track" />
                <Label htmlFor="track" className="flex-1 cursor-pointer">To track and improve my social performance</Label>
              </div>
              <div className="flex items-center space-x-2 border p-4 rounded-lg">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="flex-1 cursor-pointer">Other</Label>
              </div>
              {formData.goal === 'other' && (
                <Input 
                  placeholder="Tell us more about your goal" 
                  className="mt-2" 
                />
              )}
            </RadioGroup>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Connect at least two accounts to get AI content recommendations and analytics
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`border p-4 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-muted ${formData.connectedPlatforms.includes('Instagram') ? 'border-primary' : ''}`}
                onClick={() => handlePlatformToggle('Instagram')}
              >
                <Checkbox 
                  checked={formData.connectedPlatforms.includes('Instagram')}
                  className="pointer-events-none"
                />
                <div className="flex items-center space-x-2">
                  <Instagram className="h-5 w-5 text-pink-500" />
                  <span>Instagram</span>
                </div>
              </div>
              <div 
                className={`border p-4 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-muted ${formData.connectedPlatforms.includes('TikTok') ? 'border-primary' : ''}`}
                onClick={() => handlePlatformToggle('TikTok')}
              >
                <Checkbox 
                  checked={formData.connectedPlatforms.includes('TikTok')}
                  className="pointer-events-none"
                />
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.589 6.686C19.3033 6.4857 19.0476 6.23887 18.831 5.952C18.2595 5.23014 17.9617 4.34001 18.0003 3.43C18.0003 3.39 18.0003 3.35 18.0003 3.31C18.0003 3.21 18.0003 3.12 18.0003 3C17.9565 3.00003 17.9129 3.00271 17.87 3.01C17.658 3.043 17.458 3.09 17.2599 3.16C16.764 3.34 16.3 3.63 15.9003 4.01C15.4305 4.47899 15.0716 5.0485 14.8499 5.68C14.77 5.89 14.7099 6.12 14.6699 6.35C14.6171 6.63087 14.591 6.9152 14.5919 7.2C14.5919 7.3 14.5919 7.4 14.5919 7.5C14.5919 7.56 14.5919 7.63 14.5919 7.69V16.31C14.5919 16.61 14.4819 16.89 14.2919 17.1C14.196 17.2031 14.0783 17.2848 13.9468 17.3386C13.8153 17.3925 13.673 17.4173 13.5304 17.411C13.3877 17.4047 13.2487 17.3674 13.1232 17.302C12.9978 17.2365 12.8892 17.1444 12.8044 17.0326C12.7197 16.9207 12.6606 16.792 12.6317 16.6552C12.6027 16.5184 12.6046 16.3771 12.6371 16.241C12.6697 16.1049 12.7322 15.9776 12.82 15.868C12.8397 15.843 12.8573 15.8167 12.8729 15.789C13.0729 15.519 13.1829 15.179 13.1829 14.83V8.83C13.1829 8.8 13.1829 8.77 13.1829 8.74C13.1829 8.4 13.1429 8.07 13.0629 7.75C12.9438 7.29914 12.7276 6.8784 12.4299 6.52C12.0099 6.01 11.4199 5.64 10.7599 5.5C9.84224 5.35914 8.91384 5.61143 8.19992 6.2C7.48601 6.78857 7.05534 7.6395 7.01991 8.56C7.00991 8.69 6.99991 8.82 6.99991 8.96C6.99991 9.05 7.02991 9.13 7.02991 9.22V14.67C7.02991 14.7 7.02991 14.72 7.02991 14.75C7.02991 15.75 6.72991 16.68 6.17991 17.45C5.8834 17.8713 5.51577 18.2296 5.09991 18.51C4.68991 18.81 4.21991 19.03 3.71991 19.16C3.1308 19.3301 2.51426 19.3758 1.90991 19.29C1.90991 19.39 1.90991 19.49 1.90991 19.59C1.90991 19.7 1.90991 19.8 1.90991 19.9C1.90991 19.93 1.90991 19.97 1.90991 20C1.93941 20.0029 1.96908 20.0029 1.99858 20C2.32231 20.0001 2.6451 19.9674 2.96372 19.9024C3.28235 19.8374 3.59418 19.7406 3.89412 19.614C4.19406 19.4874 4.47971 19.3319 4.74504 19.1502C5.01038 18.9685 5.25316 18.7618 5.46991 18.534C5.57991 18.414 5.68991 18.294 5.78991 18.164C6.18991 17.654 6.50991 17.084 6.73991 16.464C6.96991 15.844 7.09991 15.2 7.09991 14.514C7.09991 14.464 7.09991 14.424 7.09991 14.374V9.164C7.09991 9.134 7.09991 9.104 7.09991 9.074C7.09991 8.304 7.42991 7.584 7.98991 7.094C8.1957 6.93261 8.43253 6.80946 8.68545 6.7323C8.93837 6.65515 10.2033 6.59134 10.4699 6.684C11.5499 6.964 12.1499 7.894 12.1499 9.154V15.154C12.1499 15.974 12.4799 16.744 13.0399 17.294C13.4399 17.684 13.9399 17.954 14.4899 18.064C15.2284 18.2294 15.9978 18.1256 16.6599 17.774C16.9499 17.624 17.2199 17.424 17.4399 17.184C17.5399 17.074 17.6299 16.954 17.6999 16.824C17.9699 16.334 18.1399 15.774 18.1399 15.174V8.824C18.1399 8.764 18.1399 8.704 18.1399 8.644V6.884L18.3999 6.944C18.7999 7.034 19.1999 7.054 19.5999 7.054C19.6708 7.05343 19.7417 7.05343 19.8126 7.054C19.7413 6.92912 19.6631 6.80936 19.579 6.696L19.589 6.686Z" fill="black"/>
                  </svg>
                  <span>TikTok</span>
                </div>
              </div>
              <div 
                className={`border p-4 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-muted ${formData.connectedPlatforms.includes('LinkedIn') ? 'border-primary' : ''}`}
                onClick={() => handlePlatformToggle('LinkedIn')}
              >
                <Checkbox 
                  checked={formData.connectedPlatforms.includes('LinkedIn')}
                  className="pointer-events-none"
                />
                <div className="flex items-center space-x-2">
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  <span>LinkedIn</span>
                </div>
              </div>
              <div 
                className={`border p-4 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-muted ${formData.connectedPlatforms.includes('Youtube') ? 'border-primary' : ''}`}
                onClick={() => handlePlatformToggle('Youtube')}
              >
                <Checkbox 
                  checked={formData.connectedPlatforms.includes('Youtube')}
                  className="pointer-events-none"
                />
                <div className="flex items-center space-x-2">
                  <Youtube className="h-5 w-5 text-red-600" />
                  <span>YouTube</span>
                </div>
              </div>
              <div 
                className={`border p-4 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-muted ${formData.connectedPlatforms.includes('Twitter') ? 'border-primary' : ''}`}
                onClick={() => handlePlatformToggle('Twitter')}
              >
                <Checkbox 
                  checked={formData.connectedPlatforms.includes('Twitter')}
                  className="pointer-events-none"
                />
                <div className="flex items-center space-x-2">
                  <Twitter className="h-5 w-5 text-blue-400" />
                  <span>Twitter/X</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              By connecting your accounts, Hey Megan will analyze your social data to provide personalized recommendations.
            </p>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="py-8">
              <div className="bg-primary/10 mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-xl font-medium">All set up!</h3>
              <p className="text-muted-foreground mt-2">
                Your account is ready to go. Let's get you into Hey Megan!
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Let's set up your account"}
            {step === 2 && "Enter your billing information"}
            {step === 3 && "We'd like to get to know you"}
            {step === 4 && "Add your social accounts"}
            {step === 5 && "Let's get you into Hey Megan!"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Create your Hey Megan account"}
            {step === 2 && "Start your 7-day free trial"}
            {step === 3 && "This helps us personalize your experience"}
            {step === 4 && "Connect your social media accounts"}
            {step === 5 && "Everything is ready for you"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && step < 5 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <div className={step > 1 && step < 5 ? 'ml-auto' : 'w-full'}>
            <Button 
              onClick={handleNext} 
              className={step < 5 ? '' : 'w-full'}
            >
              {step < 5 ? 'Continue' : "Let's Go!"}
            </Button>
          </div>
        </CardFooter>
        {step < 5 && (
          <div className="px-6 pb-4">
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Step {step} of 5</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Onboarding;
