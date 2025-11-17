import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignUp, useUser, UserButton } from "@clerk/clerk-react";
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
import { stripePromise } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentForm } from "@/components/StripePaymentForm";
import { PaymentSetupStep } from "@/components/PaymentSetupStep";

// Define the steps in the onboarding flow
type OnboardingStep = 
  | "account-creation" 
  | "email-verification"
  | "payment-setup" 
  | "user-goals" 
  | "connect-social" 
  | "welcome";

// Form validation schemas
const accountCreationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string()
    .min(1, { message: "Email is required" })
    .transform((email) => {
      // Comprehensive email cleaning
      const cleaned = email
        .trim() // Remove whitespace
        .toLowerCase() // Convert to lowercase
        .normalize(); // Unicode normalization
      
      console.log('=== CLIENT-SIDE EMAIL CLEANING ===');
      console.log(`Original: "${email}"`);
      console.log(`Cleaned: "${cleaned}"`);
      console.log(`Cleaning changed email: ${email !== cleaned}`);
      console.log(`Original length: ${email.length}`);
      console.log(`Cleaned length: ${cleaned.length}`);
      console.log(`Original char codes: [${Array.from(email).map(c => c.charCodeAt(0)).join(', ')}]`);
      console.log(`Cleaned char codes: [${Array.from(cleaned).map(c => c.charCodeAt(0)).join(', ')}]`);
      
      return cleaned;
    })
    .refine((email) => {
      // Enhanced email validation with detailed logging
      const hasAt = email.includes('@');
      const hasDot = email.includes('.');
      const atIndex = email.indexOf('@');
      const lastDotIndex = email.lastIndexOf('.');
      const atCount = (email.match(/@/g) || []).length;
      const isBasicFormat = hasAt && hasDot && atIndex > 0 && lastDotIndex > atIndex && atCount === 1;
      
      // RFC 5322 compliant regex (more permissive)
      const rfcCompliant = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
      
      // Domain-specific checks
      const domain = email.split('@')[1] || '';
      const isHeyMeganDomain = domain.includes('heymegan.com');
      const hasValidTLD = domain.includes('.') && domain.split('.').pop().length >= 2;
      
      console.log('=== CLIENT-SIDE EMAIL VALIDATION ===', {
        email,
        hasAt,
        hasDot,
        atIndex,
        lastDotIndex,
        atCount,
        isBasicFormat,
        rfcCompliant,
        emailLength: email.length,
        domain,
        isHeyMeganDomain,
        hasValidTLD,
        finalValidation: isBasicFormat && rfcCompliant && hasValidTLD
      });
      
      return isBasicFormat && rfcCompliant && hasValidTLD;
    }, { message: "Please enter a valid email address" }),
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
  const [searchParams] = useSearchParams();
  const { isSignedIn, user } = useUser();
  const { hasCompletedOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("account-creation");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>('');

  // Redirect users who have already completed onboarding
  useEffect(() => {
    if (isSignedIn && hasCompletedOnboarding) {
      console.log('✅ User has already completed onboarding, redirecting to dashboard');
      navigate('/home-page');
    }
  }, [isSignedIn, hasCompletedOnboarding, navigate]);

  // Check URL parameters on mount to determine initial step
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam && ['account-creation', 'email-verification', 'payment-setup', 'user-goals', 'connect-social', 'welcome'].includes(stepParam)) {
      console.log('🔗 Setting initial step from URL parameter:', stepParam);
      setCurrentStep(stepParam as OnboardingStep);
    }
  }, [searchParams]);

  // Auto-advance to payment setup if user is already signed in with Clerk
  useEffect(() => {
    if (isSignedIn && currentStep === "account-creation") {
      console.log('✅ User is signed in with Clerk, advancing to payment setup');
      setCurrentStep("payment-setup");
    }
  }, [isSignedIn, currentStep]);

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
  const onAccountSubmit = async (data: z.infer<typeof accountCreationSchema>) => {
    // Prevent multiple submissions immediately
    if (isSubmitting) {
      console.log('⚠️ Account creation already in progress, ignoring duplicate submission');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("=== ONBOARDING FORM SUBMISSION ===");
      console.log(`🎯 User form input email: "${data.email}"`);
      console.log(`🎯 User form input name: "${data.name}"`);
      console.log(`🎯 Form submission timestamp: ${new Date().toISOString()}`);

      // Store exact user input for verification
      const userEnteredEmail = data.email;
      console.log(`🎯 userEnteredEmail variable: "${userEnteredEmail}"`);

      // Import the simplified signUp function (no retry logic)
      const { signUp } = await import('../auth');

      console.log(`🚀 Calling signUp with email: "${userEnteredEmail}"`);
      
      const signUpResult = await signUp(userEnteredEmail, data.password, data.name);

      console.log("SignUp function completed, result:", signUpResult);

      if (!signUpResult) {
        console.error('❌ No result returned from signUp function');
        alert('Account creation failed: No response from signup function');
        return;
      }

      if (signUpResult.error) {
        console.error('❌ Signup failed:', signUpResult.error);
        
        // Handle rate limiting specifically
        if (signUpResult.error.isRateLimit) {
          alert('Signup in progress, please check your email or try again shortly');
          return;
        }
        
        // Handle other errors
        alert(`Account creation failed: ${signUpResult.error.message}`);
        return;
      }

      if (signUpResult.success) {
        console.log('✅ Account creation successful');
        
        // Check if email verification is needed
        if (signUpResult.needsVerification) {
          console.log('📧 Email verification required');
          setPendingVerificationEmail(userEnteredEmail);
          setCurrentStep("email-verification");
        } else {
          console.log('✅ Account verified, proceeding to payment setup');
          setCurrentStep("payment-setup");
        }
      } else {
        console.error('❌ Unexpected signup response:', signUpResult);
        alert('Account creation failed: Unexpected response format');
      }

    } catch (outerError) {
      console.error('❌ Unexpected error during account creation:', outerError);

      const errorMessage = outerError instanceof Error 
        ? outerError.message 
        : 'Unknown error during account creation';

      alert(`Account creation failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPaymentSubmit = async (values: z.infer<typeof paymentSetupSchema>) => {
    console.log("Payment form submitted:", values);
    console.log("STRIPE FUNCTIONALITY COMMENTED OUT - SKIPPING TO NEXT STEP");

    // TODO: Re-enable Stripe functionality later
    /*
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      const accountData = accountForm.getValues();

      // Step 1: Get the current authenticated user (should already exist from account creation step)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(`Failed to get authenticated user: ${authError?.message || 'No user found. Please try creating your account again.'}`);
      }

      console.log('Using existing authenticated user:', user.id);

      // Step 2: Create Stripe customer
      console.log("Creating Stripe customer...");
      const customerResponse = await fetch('/api/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email || accountData.email,
          name: accountData.name,
          userId: user.id
        })
      });

      if (!customerResponse.ok) {
        const errorText = await customerResponse.text();
        throw new Error(`Failed to create Stripe customer: ${errorText}`);
      }

      const { customerId } = await customerResponse.json();
      console.log("Stripe customer created:", customerId);

      // Step 3: Create payment method and attach to customer
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: values.cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(values.expiryDate.split('/')[0]),
          exp_year: parseInt('20' + values.expiryDate.split('/')[1]),
          cvc: values.cvc,
        },
        billing_details: {
          name: values.cardHolderName,
          email: user.email || accountData.email,
        },
      });

      if (pmError) throw new Error(`Payment method creation failed: ${pmError.message}`);

      console.log("Payment method created:", paymentMethod.id);

      // Step 4: Attach payment method to customer
      const attachResponse = await fetch('/api/attach-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          customerId: customerId
        })
      });

      if (!attachResponse.ok) {
        const errorText = await attachResponse.text();
        throw new Error(`Failed to attach payment method: ${errorText}`);
      }

      console.log("Payment method attached to customer");

      // Step 5: Create subscription
      const planData = paymentForm.getValues();
      const priceId = values.billingPlan === 'annual' ? 'price_annual' : 'price_monthly';

      const subscriptionResponse = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId,
          priceId: priceId,
          paymentMethodId: paymentMethod.id
        })
      });

      if (!subscriptionResponse.ok) {
        const errorText = await subscriptionResponse.text();
        throw new Error(`Failed to create subscription: ${errorText}`);
      }

      const { subscription } = await subscriptionResponse.json();
      console.log("Subscription created:", subscription.id);

      // Step 6: Update existing user profile with Stripe data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          plan_type: values.billingPlan,
          is_on_trial: subscription.status === 'trialing',
          trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
        })
        .eq('id', user.id);

      if (updateError) {
        console.error("Failed to update user profile:", updateError);
        // Don't throw here - subscription was created successfully
      }

      console.log("Payment setup completed successfully!");

      // Continue to next onboarding step
      setCurrentStep("user-goals");

    } catch (error) {
      console.error("Payment setup error:", error);
      alert(`Payment setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    */

    // For now, just proceed to the next step without payment processing
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

  const handleEmailVerificationComplete = () => {
    console.log('✅ Email verification completed');
    setPendingVerificationEmail('');
    setCurrentStep("payment-setup");
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case "email-verification":
        setCurrentStep("account-creation");
        break;
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
      case "email-verification":
        return (
          <EmailVerificationStatus
            email={pendingVerificationEmail}
            onVerificationComplete={handleEmailVerificationComplete}
            onBack={() => setCurrentStep("account-creation")}
          />
        );

      case "account-creation":
        return (
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold">Let's set up your account</h2>
              <p className="text-muted-foreground mt-2">Create your account to get started</p>
            </div>
            <SignUp
              routing="hash"
              afterSignUpUrl="/onboarding?step=payment-setup"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-lg"
                }
              }}
            />
          </div>
        );

      case "payment-setup":
        if (!user) {
          return <div>Loading user information...</div>;
        }

        return (
          <PaymentSetupStep
            user={user}
            onSuccess={() => setCurrentStep("user-goals")}
            onBack={goToPreviousStep}
          />
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
                      <FormItem className="mb-8 mt-0">
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
                      <FormItem className="mb-8 mt-20">
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
                      <FormItem className="mb-8 mt-20">
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
                      <FormItem className="mb-8 mt-20">
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
                      <FormItem className="mb-8 mt-32">
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      {/* Header with auth button */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-end px-6 gap-2">
          {isSignedIn && (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md mb-8">
        <div className="mb-4">
          <div className="w-full">
            <ul className="steps w-full">
              <li className={`step ${["account-creation", "email-verification", "payment-setup", "user-goals", "connect-social", "welcome"].includes(currentStep) ? "step-primary" : ""}`}></li>
              <li className={`step ${["email-verification", "payment-setup", "user-goals", "connect-social", "welcome"].includes(currentStep) ? "step-primary" : ""}`}></li>
              <li className={`step ${["payment-setup", "user-goals", "connect-social", "welcome"].includes(currentStep) ? "step-primary" : ""}`}></li>
              <li className={`step ${["user-goals", "connect-social", "welcome"].includes(currentStep) ? "step-primary" : ""}`}></li>
              <li className={`step ${["connect-social", "welcome"].includes(currentStep) ? "step-primary" : ""}`}></li>
              <li className={`step ${["welcome"].includes(currentStep) ? "step-primary" : ""}`}></li>
            </ul>
          </div>
        </div>
      </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow;