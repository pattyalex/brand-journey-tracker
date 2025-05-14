import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Instagram, Youtube, Linkedin, Twitter, Music } from "lucide-react";

// Define the steps in the onboarding flow
type OnboardingStep = 
  | "account-creation" 
  | "payment-setup" 
  | "user-goals" 
  | "connect-social" 
  | "welcome";

// Form validation schemas
const accountCreationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(10, { message: "Password must be at least 10 characters" })
    .regex(/[A-Z]/, { message: "Password must include an uppercase letter" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must include a special character" })
});

const paymentSetupSchema = z.object({
  cardNumber: z.string().min(16, { message: "Please enter a valid card number" }),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, { message: "Please use format MM/YY" }),
  cvc: z.string().min(3, { message: "Please enter a valid CVC" }),
  billingPlan: z.enum(["monthly", "annual"]),
});

const userGoalsSchema = z.object({
  goal: z.enum(["organize", "guidance", "performance", "other"]),
  otherGoal: z.string().optional(),
});

const socialAccountsSchema = z.object({
  instagram: z.boolean().optional(),
  tiktok: z.boolean().optional(),
  youtube: z.boolean().optional(),
  linkedin: z.boolean().optional(),
  twitter: z.boolean().optional(),
});

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("account-creation");

  // Account Creation Form
  const accountForm = useForm<z.infer<typeof accountCreationSchema>>({
    resolver: zodResolver(accountCreationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  // Payment Setup Form
  const paymentForm = useForm<z.infer<typeof paymentSetupSchema>>({
    resolver: zodResolver(paymentSetupSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvc: "",
      billingPlan: "monthly"
    },
    mode: "onChange"
  });

  // User Goals Form
  const goalForm = useForm<z.infer<typeof userGoalsSchema>>({
    resolver: zodResolver(userGoalsSchema),
    defaultValues: {
      goal: "organize"
    }
  });

  // Social Accounts Form
  const socialForm = useForm<z.infer<typeof socialAccountsSchema>>({
    resolver: zodResolver(socialAccountsSchema),
    defaultValues: {
      instagram: false,
      tiktok: false,
      youtube: false,
      linkedin: false,
      twitter: false
    }
  });

  // Handle form submissions
  const onAccountSubmit = (data: z.infer<typeof accountCreationSchema>) => {
    console.log("Account data:", data);
    setCurrentStep("payment-setup");
  };

  const onPaymentSubmit = (data: z.infer<typeof paymentSetupSchema>) => {
    console.log("Payment data:", data);
    setCurrentStep("user-goals");
  };

  const onGoalSubmit = (data: z.infer<typeof userGoalsSchema>) => {
    console.log("Goal data:", data);
    setCurrentStep("connect-social");
  };

  const onSocialSubmit = (data: z.infer<typeof socialAccountsSchema>) => {
    console.log("Social accounts:", data);
    setCurrentStep("welcome");
  };

  const goToHomePage = () => {
    navigate("/home");
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case "account-creation":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Let's set up your account</CardTitle>
              <CardDescription>Create your account to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                  <FormField
                    control={accountForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          At least 10 characters, includes uppercase and special character
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Continue</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "payment-setup":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Enter your billing information</CardTitle>
              <CardDescription>
                You won't be charged today. After 7 days, your trial will convert into a paid subscription.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...paymentForm}>
                <form 
                  onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} 
                  className="space-y-4"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="payment"
                >
                  {/* Hidden field to trick browsers into not autofilling payment fields with email */}
                  <input type="text" name="email" style={{ display: 'none' }} />
                  <FormField
                    control={paymentForm.control}
                    name="billingPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Plan</FormLabel>
                        <div className="border rounded-md p-4 my-2">
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="monthly" id="monthly" />
                              <Label htmlFor="monthly" className="font-medium">
                                Monthly billing: $17/month
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                      control={paymentForm.control}
                      name="cardNumber"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                              <input
                                type="tel"
                                inputMode="numeric"
                                name="cc-number" // Changed from cardNumber to break any connection
                                id="cc-number-field" // Changed from cardNumber to break any connection
                                placeholder="1234 5678 9012 3456"
                                autoComplete="off" // Disabling autocomplete completely
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                data-lpignore="true" // Ignore LastPass autofill
                                data-form-type="payment" // Help browsers identify as payment form
                                pattern="[0-9\s]{13,19}"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={field.value || ''}
                                onChange={(e) => {
                                  // Only allow numbers and spaces
                                  const value = e.target.value.replace(/[^0-9\s]/g, '');
                                  field.onChange(value);
                                }}
                                onFocus={(e) => {
                                  // Aggressively clear on focus
                                  if (field.value && (field.value.includes('@') || !field.value.match(/^[\d\s]*$/))) {
                                    field.onChange('');
                                  }
                                }}
                                onInput={(e) => {
                                  // Extra check during input to prevent unwanted characters
                                  const target = e.target as HTMLInputElement;
                                  if (target.value.includes('@')) {
                                    field.onChange('');
                                  }
                                }}
                                ref={(input) => {
                                  if (input) {
                                    // Clear field if it contains an email on component mount/update
                                    if (field.value && (field.value.includes('@') || !field.value.match(/^[\d\s]*$/))) {
                                      field.onChange('');
                                      input.setAttribute('autocomplete', 'off');

                                      // Force field clearing and focus
                                      setTimeout(() => {
                                        field.onChange('');
                                        input.focus();
                                      }, 100);
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                  <div className="flex space-x-4">
                    <FormField
                      control={paymentForm.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="cvc"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>CVC</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">Continue</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "user-goals":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">We'd like to get to know you</CardTitle>
              <CardDescription>This helps us tailor the experience to your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...goalForm}>
                <form onSubmit={goalForm.handleSubmit(onGoalSubmit)} className="space-y-4">
                  <FormField
                    control={goalForm.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's your most important goal?</FormLabel>
                        <div className="space-y-2 mt-2">
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <div className="flex items-center space-x-2 py-2">
                              <RadioGroupItem value="organize" id="organize" />
                              <Label htmlFor="organize" className="font-medium">
                                To organize my content creation work
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-2">
                              <RadioGroupItem value="guidance" id="guidance" />
                              <Label htmlFor="guidance" className="font-medium">
                                To get guidance on content ideas
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-2">
                              <RadioGroupItem value="performance" id="performance" />
                              <Label htmlFor="performance" className="font-medium">
                                To track and improve my social performance
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-2">
                              <RadioGroupItem value="other" id="other" />
                              <Label htmlFor="other" className="font-medium">
                                Other
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {goalForm.watch("goal") === "other" && (
                    <FormField
                      control={goalForm.control}
                      name="otherGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Please specify your goal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button type="submit" className="w-full">Continue</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "connect-social":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Add your social accounts</CardTitle>
              <CardDescription>
                Connect your social media accounts to unlock analytics and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...socialForm}>
                <form onSubmit={socialForm.handleSubmit(onSocialSubmit)} className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={socialForm.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center space-x-3">
                            <Instagram className="h-5 w-5 text-pink-600" />
                            <FormLabel className="font-normal">Instagram</FormLabel>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={socialForm.control}
                      name="tiktok"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center space-x-3">
                            <Music className="h-5 w-5 text-black" />
                            <FormLabel className="font-normal">TikTok</FormLabel>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={socialForm.control}
                      name="youtube"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center space-x-3">
                            <Youtube className="h-5 w-5 text-red-600" />
                            <FormLabel className="font-normal">YouTube</FormLabel>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={socialForm.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center space-x-3">
                            <Linkedin className="h-5 w-5 text-blue-600" />
                            <FormLabel className="font-normal">LinkedIn</FormLabel>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={socialForm.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center space-x-3">
                            <Twitter className="h-5 w-5 text-blue-400" />
                            <FormLabel className="font-normal">Twitter/X</FormLabel>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">Continue</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "welcome":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">🎉 Let's get you into Hey Megan!</CardTitle>
              <CardDescription className="text-center">
                Your account is all set up and ready to go.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={goToHomePage} size="lg">
                Let's go!
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 py-12 px-4">
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between mb-4">
          <div className="w-full max-w-xs">
            <ul className="steps steps-vertical md:steps-horizontal w-full">
              <li className={`step ${currentStep === "account-creation" || currentStep === "payment-setup" || currentStep === "user-goals" || currentStep === "connect-social" || currentStep === "welcome" ? "step-primary" : ""}`}>1</li>
              <li className={`step ${currentStep === "payment-setup" || currentStep === "user-goals" || currentStep === "connect-social" || currentStep === "welcome" ? "step-primary" : ""}`}>2</li>
              <li className={`step ${currentStep === "user-goals" || currentStep === "connect-social" || currentStep === "welcome" ? "step-primary" : ""}`}>3</li>
              <li className={`step ${currentStep === "connect-social" || currentStep === "welcome" ? "step-primary" : ""}`}>4</li>
              <li className={`step ${currentStep === "welcome" ? "step-primary" : ""}`}>5</li>
            </ul>
          </div>
        </div>
      </div>

      {renderStep()}
    </div>
  );
};

export default OnboardingFlow;