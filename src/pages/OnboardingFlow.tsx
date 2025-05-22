import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  cardHolderName: z.string().min(2, { message: "Please enter the name on your card" }),
  cardNumber: z.string()
    .min(13, { message: "Card number must be at least 13 digits" })
    .max(19, { message: "Card number must not exceed 19 digits" })
    .regex(/^[0-9\s]+$/, { message: "Card number must contain only digits" }),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, { message: "Please use format MM/YY" })
    .refine((val) => {
      const [month, year] = val.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      return (
        month >= 1 && 
        month <= 12 && 
        (year > currentYear || (year === currentYear && month >= currentMonth))
      );
    }, { message: "Expiry date cannot be in the past" }),
  cvc: z.string()
    .min(3, { message: "CVC must be at least 3 digits" })
    .max(4, { message: "CVC must not exceed 4 digits" })
    .regex(/^\d+$/, { message: "CVC must contain only digits" }),
  billingPlan: z.enum(["monthly", "annual"]),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});

const userGoalsSchema = z.object({
  goal: z.enum(["organize", "guidance", "performance", "other"]),
  otherGoal: z.string().optional(),
  postFrequency: z.enum(["several_times_a_day", "daily", "few_times_a_week", "occasionally"]),
  platforms: z.object({
    instagram: z.boolean().default(false),
    tiktok: z.boolean().default(false),
    youtube: z.boolean().default(false),
    other: z.boolean().default(false)
  }),
  otherPlatform: z.string().optional(),
  stuckAreas: z.object({
    consistency: z.boolean().default(false),
    overwhelmed: z.boolean().default(false),
    ideas: z.boolean().default(false),
    partnerships: z.boolean().default(false),
    analytics: z.boolean().default(false),
    organization: z.boolean().default(false),
    other: z.boolean().default(false)
  }),
  otherStuckArea: z.string().optional(),
  ideationMethod: z.enum(["plan_ahead", "wing_it", "follow_trends", "struggle"]),
  teamStructure: z.enum(["solo", "has_assistant", "team_agency", "other"]),
  creatorDream: z.enum(["quit_job", "grow_followers", "build_brand", "launch_products", "inspire_others", "other"]),
  otherTeamStructure: z.string().optional(),
  otherCreatorDream: z.string().optional(),
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
      cardHolderName: "",
      cardNumber: "",
      expiryDate: "",
      cvc: "",
      billingPlan: "monthly",
      termsAccepted: false
    },
    mode: "onChange"
  });

  // User Goals Form
  const goalForm = useForm<z.infer<typeof userGoalsSchema>>({
    resolver: zodResolver(userGoalsSchema),
    defaultValues: {
      goal: "organize",
      postFrequency: "few_times_a_week",
      platforms: {
        instagram: false,
        tiktok: false,
        youtube: false,
        other: false
      },
      stuckAreas: {
        consistency: false,
        overwhelmed: false,
        ideas: false,
        partnerships: false,
        analytics: false,
        organization: false,
        other: false
      },
      ideationMethod: "plan_ahead",
      teamStructure: "solo",
      creatorDream: "grow_followers"
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

    // Prevent accidental submissions if user was just trying to type in "Other" fields
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.tagName === 'INPUT') {
      // If user is currently focused on an input field, don't proceed
      return;
    }

    setCurrentStep("connect-social");
  };

  const onSocialSubmit = (data: z.infer<typeof socialAccountsSchema>) => {
    console.log("Social accounts:", data);
    setCurrentStep("welcome");
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case "payment-setup":
        setCurrentStep("account-creation");
        break;
      case "user-goals":
        setCurrentStep("payment-setup");
        break;
      case "connect-social":
        setCurrentStep("user-goals");
        break;
      case "welcome":
        setCurrentStep("connect-social");
        break;
      default:
        break;
    }
  };

  const goToHomePage = () => {
    navigate("/home-page");
  };

  // Get auth context at component level, not inside the function
  const { login, completeOnboarding } = useAuth();

  const finishOnboarding = () => {
    // Mark user as authenticated and having completed onboarding
    login(); // Mark user as authenticated
    completeOnboarding(); // Mark onboarding as completed

    // Then redirect to Home Page
    navigate("/home-page");
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
            <CardHeader className="relative">

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
                  data-form-type="other"
                  id="payment-form-separate-from-auth"
                >
                  {/* Add multiple decoy fields to break browser autofill algorithms */}
                  <div style={{ display: 'none' }}>
                    <input type="text" name="username" />
                    <input type="email" name="hidden-email" />
                    <input type="password" name="hidden-password" />
                  </div>
                  <FormField
                    control={paymentForm.control}
                    name="billingPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select a Plan</FormLabel>
                        <div className="space-y-3 my-2">
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-start space-x-2 border rounded-md p-4 hover:bg-muted/50 transition-colors">
                              <RadioGroupItem value="monthly" id="monthly" className="mt-1" />
                              <div className="flex-1">
                                <Label htmlFor="monthly" className="font-medium text-lg">
                                  Monthly Plan
                                </Label>
                                <p className="text-muted-foreground text-sm mt-1">
                                  $17 per month, billed monthly
                                </p>
                                <div className="mt-2">
                                  <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                                    Most popular
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2 border rounded-md p-4 hover:bg-muted/50 transition-colors">
                              <RadioGroupItem value="annual" id="annual" className="mt-1" />
                              <div className="flex-1">
                                <Label htmlFor="annual" className="font-medium text-lg">
                                  Annual Plan
                                </Label>
                                <p className="text-muted-foreground text-sm mt-1">
                                  $14 per month, billed annually ($168)
                                </p>
                                <div className="mt-2">
                                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                    Save 18%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-center gap-2 mt-2 mb-4">
                    <svg className="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4,4h16c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H4c-1.1,0-2-0.9-2-2V6C2,4.9,2.9,4,4,4z" />
                    </svg>
                    <svg className="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="#EB001B" opacity="0.6" />
                      <circle cx="12" cy="12" r="10" fill="#F79E1B" opacity="0.6" style={{transform: 'translateX(4px)'}} />
                    </svg>
                    <svg className="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24">
                      <path d="M22,12c0,5.5-4.5,10-10,10S2,17.5,2,12S6.5,2,12,2S22,6.5,22,12z" fill="#006FCF" opacity="0.6" />
                    </svg>
                    <svg className="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24">
                      <path d="M2.5,10.5l2,-4.5h15l2,4.5" fill="#FF5F00" opacity="0.6" />
                      <path d="M2.5,10.5v5.5h19v-5.5" fill="#EB001B" opacity="0.6" />
                    </svg>
                  </div>

                  <FormField
                    control={paymentForm.control}
                    name="cardHolderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name on Card</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            {...field}
                            autoComplete="cc-name"
                          />
                        </FormControl>
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
                            <Input
                              type="tel"
                              inputMode="numeric"
                              placeholder="1234 5678 9012 3456"
                              autoComplete="cc-number"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck="false"
                              data-lpignore="true" 
                              aria-label="Card number input"
                              value={field.value}
                              onChange={(e) => {
                                // Format with spaces every 4 digits
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            We accept Visa, Mastercard, American Express, and Discover
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <div className="flex space-x-4">
                    <FormField
                      control={paymentForm.control}
                      name="expiryDate"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex-1">
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="MM/YY" 
                                autoComplete="cc-exp"
                                value={field.value}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/[^0-9]/g, '');

                                  // Format as MM/YY
                                  if (value.length > 2) {
                                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                  }

                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="cvc"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex-1">
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="123" 
                                autoComplete="cc-csc"
                                maxLength={4}
                                value={field.value}
                                onChange={(e) => {
                                  // Only allow numbers
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <FormField
                    control={paymentForm.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                          </FormLabel>
                          <FormDescription>
                            Your card will not be charged until after your 7-day trial ends.
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between mt-6">
                    <Button variant="ghost" size="sm" onClick={goToPreviousStep} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 ml-4">Continue</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "user-goals":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="relative pb-2">
              <CardTitle className="text-2xl">We'd like to get to know you</CardTitle>
              <CardDescription>This helps us tailor the experience to your needs</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Form {...goalForm}>
                <form 
                  onSubmit={(e) => {
                    // Extra safeguard to prevent accidental submissions from "Enter" key
                    const activeElement = document.activeElement as HTMLElement;
                    if (activeElement && activeElement.tagName === 'INPUT') {
                      e.preventDefault();
                      return;
                    }
                    goalForm.handleSubmit(onGoalSubmit)(e);
                  }} 
                  className="space-y-2"
                >
                  <FormField
                    control={goalForm.control}
                    name="postFrequency"
                    render={({ field }) => (
                      <FormItem className="mb-8 mt-4">
                        <FormLabel className="font-medium text-xl bg-gray-100 px-4 py-3 rounded-md block shadow-sm w-full">
                          How often do you want to create or post content?
                        </FormLabel>
                        <div className="space-y-2 mt-4">
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="several_times_a_day" id="several_times_a_day" />
                              <Label htmlFor="several_times_a_day" className="font-medium">
                                Several times a day
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="daily" id="daily" />
                              <Label htmlFor="daily" className="font-medium">
                                Daily
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="few_times_a_week" id="few_times_a_week" />
                              <Label htmlFor="few_times_a_week" className="font-medium">
                                A few times a week
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="occasionally" id="occasionally" />
                              <Label htmlFor="occasionally" className="font-medium">
                                Occasionally
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={goalForm.control}
                    name="ideationMethod"
                    render={({ field }) => (
                      <FormItem className="mb-8 mt-8">
                        <FormLabel className="font-medium text-xl bg-gray-100 px-4 py-3 rounded-md block shadow-sm w-full">
                          How do you come up with content ideas today?
                        </FormLabel>
                        <div className="space-y-2 mt-4">
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="plan_ahead" id="plan_ahead" />
                              <Label htmlFor="plan_ahead" className="font-medium">
                                I plan them ahead
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="wing_it" id="wing_it" />
                              <Label htmlFor="wing_it" className="font-medium">
                                I wing it day by day
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="follow_trends" id="follow_trends" />
                              <Label htmlFor="follow_trends" className="font-medium">
                                I follow trends and repost
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="struggle" id="struggle" />
                              <Label htmlFor="struggle" className="font-medium">
                                I struggle to come up with ideas
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={goalForm.control}
                    name="teamStructure"
                    render={({ field }) => (
                      <FormItem className="mb-8 mt-8">
                        <FormLabel className="font-medium text-xl bg-gray-100 px-4 py-3 rounded-md block shadow-sm w-full">
                          Do you work alone or with a team?
                        </FormLabel>
                        <div className="space-y-2 mt-4">
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="solo" id="solo" />
                              <Label htmlFor="solo" className="font-medium">
                                Just me
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="has_assistant" id="has_assistant" />
                              <Label htmlFor="has_assistant" className="font-medium">
                                I have an assistant / editor
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="team_agency" id="team_agency" />
                              <Label htmlFor="team_agency" className="font-medium">
                                I'm part of a team or agency
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="other" id="other_team" />
                              <Label htmlFor="other_team" className="font-medium">
                                Other
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {field.value === "other" && (
                          <FormField
                            control={goalForm.control}
                            name="otherTeamStructure"
                            render={({ field }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <Input 
                                    placeholder="Please specify your team structure" 
                                    {...field} 
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.currentTarget.blur();
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={goalForm.control}
                    name="creatorDream"
                    render={({ field }) => (
                      <FormItem className="mb-8 mt-8">
                        <FormLabel className="font-medium text-xl bg-gray-100 px-4 py-3 rounded-md block shadow-sm w-full">
                          What's your biggest dream as a creator?
                        </FormLabel>
                        <div className="space-y-2 mt-4">
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="quit_job" id="quit_job" />
                              <Label htmlFor="quit_job" className="font-medium">
                                Quitting my job and going full-time
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="grow_followers" id="grow_followers" />
                              <Label htmlFor="grow_followers" className="font-medium">
                                Growing my followers and engagement
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="build_brand" id="build_brand" />
                              <Label htmlFor="build_brand" className="font-medium">
                                Building a personal brand that gets me brand deals
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="launch_products" id="launch_products" />
                              <Label htmlFor="launch_products" className="font-medium">
                                Launching my own products or business
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="inspire_others" id="inspire_others" />
                              <Label htmlFor="inspire_others" className="font-medium">
                                Inspiring others / making impact
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 py-3">
                              <RadioGroupItem value="other" id="other_dream" />
                              <Label htmlFor="other_dream" className="font-medium">
                                Other
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {field.value === "other" && (
                          <FormField
                            control={goalForm.control}
                            name="otherCreatorDream"
                            render={({ field }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <Input 
                                    placeholder="Please specify your creator dream" 
                                    {...field} 
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.currentTarget.blur();
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={goalForm.control}
                    name="platforms"
                    render={() => (
                      <FormItem className="mb-8 mt-8">
                        <FormLabel className="font-medium text-xl bg-gray-100 px-4 py-3 rounded-md block shadow-sm w-full">
                          Which platforms do you want to focus on right now?
                        </FormLabel>
                        <FormDescription className="mt-2 text-sm">
                          Select all that apply
                        </FormDescription>
                        <div className="space-y-2 mt-2">
                          <FormField
                            control={goalForm.control}
                            name="platforms.instagram"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 py-3">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Instagram
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={goalForm.control}
                            name="platforms.tiktok"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 py-3">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  TikTok
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={goalForm.control}
                            name="platforms.youtube"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 py-3">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  YouTube
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={goalForm.control}
                            name="platforms.other"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 py-3">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Other
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>

                        {goalForm.watch("platforms.other") && (
                          <FormField
                            control={goalForm.control}
                            name="otherPlatform"
                            render={({ field }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <Input 
                                    placeholder="Please specify other platforms" 
                                    {...field} 
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault(); // Prevent form submission
                                        e.currentTarget.blur(); // Blur input to save value
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={goalForm.control}
                    name="stuckAreas"
                    render={() => (
                      <FormItem className="mb-8 mt-8">
                        <FormLabel className="font-medium text-xl bg-gray-100 px-4 py-3 rounded-md block shadow-sm w-full">
                          Where do you feel most stuck in your content process?
                        </FormLabel>
                        <FormDescription className="mt-2 text-sm">
                          Select all that apply
                        </FormDescription>
                        <div className="space-y-2 mt-2">
                          <FormField
                            control={goalForm.control}
                            name="stuckAreas.consistency"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 py-3">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Staying consistent
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={goalForm.control}
                            name="stuckAreas.overwhelmed"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 py-3">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Feeling overwhelmed with planning and batching
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={goalForm.control}
                            name="stuckAreas.ideas"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 py-3">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Coming up with ideas
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={goalForm.control}
                            name="stuckAreas.partnerships"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 py-3">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Managing brand deals or partnerships
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={goalForm.control}
                            name="stuckAreas.analytics"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 py-3">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Tracking growth and analytics
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={goalForm.control}
                            name="stuckAreas.organization"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 py-3">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  No centralized place to organize everything and forgetting where things are saved
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={goalForm.control}
                            name="stuckAreas.other"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 py-3">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Other
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>

                        {goalForm.watch("stuckAreas.other") && (
                          <FormField
                            control={goalForm.control}
                            name="otherStuckArea"
                            render={({ field }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <Input 
                                    placeholder="Please specify where else you feel stuck" 
                                    {...field} 
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault(); // Prevent form submission
                                        e.currentTarget.blur(); // Blur input to save value
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  <div className="flex justify-between mt-6">
                    <Button variant="ghost" size="sm" onClick={goToPreviousStep} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 ml-4">Continue</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "connect-social":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="relative">

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

                  <div className="flex justify-between mt-6">
                    <Button variant="ghost" size="sm" onClick={goToPreviousStep} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 ml-4">Continue</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "welcome":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="relative">

              <CardTitle className="text-2xl text-center">🎉 Let's get you into Hey Megan!</CardTitle>
              <CardDescription className="text-center">
                Your account is all set up and ready to go.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="mt-8 space-y-4">
                <Button 
                  className="w-full py-6" 
                  onClick={finishOnboarding}
                >
                  Go to Home Page
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 py-12 px-4">
      <div className="w-full max-w-md mb-8">
        <div className="mb-4">
          <div className="w-full">
            <ul className="steps w-full">
              <li className={`step ${currentStep === "account-creation" || currentStep === "payment-setup" || currentStep === "user-goals" || currentStep === "connect-social" || currentStep === "welcome" ? "step-primary" : ""}`}></li>
              <li className={`step ${currentStep === "payment-setup" || currentStep === "user-goals" || currentStep === "connect-social" || currentStep === "welcome" ? "step-primary" : ""}`}></li>
              <li className={`step ${currentStep === "user-goals" || currentStep === "connect-social" || currentStep === "welcome" ? "step-primary" : ""}`}></li>
              <li className={`step ${currentStep === "connect-social" || currentStep === "welcome" ? "step-primary" : ""}`}></li>
              <li className={`step ${currentStep === "welcome" ? "step-primary" : ""}`}></li>
            </ul>
          </div>
        </div>
      </div>

      {renderStep()}
    </div>
  );
};

export default OnboardingFlow;