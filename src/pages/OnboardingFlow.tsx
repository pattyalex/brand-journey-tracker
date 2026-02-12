import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignUp, useUser, UserButton, useClerk } from "@clerk/clerk-react";
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
import { UserGoalsStep } from "@/components/UserGoalsStep";
import EmailVerificationStatus from "@/components/EmailVerificationStatus";

// Define the steps in the onboarding flow
type OnboardingStep =
  | "account-creation"
  | "plan-selection"
  | "payment-entry"
  | "user-goals"
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
  const { isSignedIn, user, isLoaded: isUserLoaded } = useUser();
  const { loaded: isClerkLoaded } = useClerk();
  const { hasCompletedOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("account-creation");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>('');
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Load Google Fonts for landing page consistency
  useEffect(() => {
    if (!document.querySelector('link[href*="DM+Sans"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

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
    if (stepParam && ['account-creation', 'plan-selection', 'payment-entry', 'user-goals', 'welcome'].includes(stepParam)) {
      console.log('🔗 Setting initial step from URL parameter:', stepParam);
      setCurrentStep(stepParam as OnboardingStep);
    }
  }, [searchParams]);

  // Auto-advance to plan selection ONLY on initial load if user is already signed in
  // (not when they explicitly navigate back)
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    if (!hasInitialized && isSignedIn && currentStep === "account-creation") {
      // Only auto-advance on first load, not when user clicks Back
      const stepParam = searchParams.get('step');
      if (!stepParam) {
        console.log('✅ User is signed in with Clerk, advancing to plan selection');
        setCurrentStep("plan-selection");
      }
      setHasInitialized(true);
    }
  }, [isSignedIn, currentStep, hasInitialized, searchParams]);

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
          // Still go to plan selection - email verification is handled separately
          setCurrentStep("plan-selection");
        } else {
          console.log('✅ Account verified, proceeding to plan selection');
          setCurrentStep("plan-selection");
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
    setCurrentStep("plan-selection");
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case "plan-selection":
        setCurrentStep("account-creation");
        break;
      case "payment-entry":
        setCurrentStep("plan-selection");
        break;
      case "user-goals":
        setCurrentStep("payment-entry");
        break;
      case "welcome":
        setCurrentStep("user-goals");
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
        // If user is already signed in (clicked Back from payment), show continue option
        if (isSignedIn && user) {
          return (
            <div className="w-full max-w-md mx-auto">
              <div
                className="rounded-3xl overflow-hidden p-8 text-center"
                style={{
                  background: '#ffffff',
                  boxShadow: '0 25px 60px -12px rgba(97, 42, 79, 0.15), 0 0 0 1px rgba(139, 112, 130, 0.08)'
                }}
              >
                <div
                  className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white font-serif text-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                    boxShadow: '0 8px 20px rgba(97, 42, 79, 0.3)'
                  }}
                >
                  M
                </div>
                <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1a1523' }}>
                  Welcome, {user.firstName || 'there'}!
                </h2>
                <p className="text-sm mb-6" style={{ color: '#6b6478' }}>
                  Your account is already set up. Continue to select your plan.
                </p>
                <button
                  onClick={() => setCurrentStep("plan-selection")}
                  className="w-full py-3.5 rounded-xl text-white font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                    boxShadow: '0 4px 12px rgba(97, 42, 79, 0.25)'
                  }}
                >
                  Continue to Plan Selection
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold">Let's set up your account</h2>
              <p className="text-muted-foreground mt-2">Create your account to get started</p>
            </div>

            {/* Consent checkbox */}
            <div className="w-full mb-4 flex items-start gap-3 px-2">
              <Checkbox
                id="signup-consent"
                checked={consentAccepted}
                onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
                className="mt-0.5"
                style={{
                  borderColor: consentAccepted ? '#7a3868' : undefined,
                  backgroundColor: consentAccepted ? '#7a3868' : undefined,
                }}
              />
              <label
                htmlFor="signup-consent"
                className="text-sm cursor-pointer leading-relaxed"
                style={{ color: '#4d3e48', fontFamily: "'DM Sans', sans-serif" }}
              >
                By signing up, you agree to our{' '}
                <a href="/terms" target="_blank" className="font-medium hover:underline" style={{ color: '#612a4f' }}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="font-medium hover:underline" style={{ color: '#612a4f' }}>
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Clerk SignUp - dimmed until consent is given */}
            <div
              className="w-full transition-all duration-300"
              style={{
                opacity: consentAccepted ? 1 : 0.4,
                pointerEvents: consentAccepted ? 'auto' : 'none',
              }}
            >
              <SignUp
                afterSignUpUrl="/onboarding?step=plan-selection"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-lg"
                  }
                }}
              />
            </div>
          </div>
        );

      case "plan-selection":
        if (!user) {
          return <div>Loading user information...</div>;
        }

        return (
          <PaymentSetupStep
            user={user}
            onContinueToPayment={() => setCurrentStep("payment-entry")}
            showPaymentForm={false}
          />
        );

      case "payment-entry":
        if (!user) {
          return <div>Loading user information...</div>;
        }

        return (
          <PaymentSetupStep
            user={user}
            onSuccess={() => setCurrentStep("user-goals")}
            onBack={() => setCurrentStep("plan-selection")}
            showPaymentForm={true}
          />
        );

      case "user-goals":
        return (
          <UserGoalsStep
            onComplete={(answers) => {
              console.log("User goals:", answers);
              setCurrentStep("welcome");
            }}
          />
        );

      case "welcome":
        return (
          <div className="w-full max-w-lg mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <div
              className="rounded-3xl overflow-hidden text-center"
              style={{
                background: '#ffffff',
                boxShadow: '0 25px 60px -12px rgba(97, 42, 79, 0.15), 0 0 0 1px rgba(139, 112, 130, 0.08)',
              }}
            >
              <div className="p-10">
                {/* Heading */}
                <h2
                  className="text-3xl font-normal mb-3"
                  style={{ color: '#1a1523', fontFamily: "'Instrument Serif', serif" }}
                >
                  You're all set!
                </h2>

                {/* Subtext */}
                <p className="text-base mb-8" style={{ color: '#6b6478' }}>
                  Your account is ready. Let's start creating amazing content.
                </p>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={finishOnboarding}
                  className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
                    boxShadow: '0 4px 12px rgba(97, 42, 79, 0.25)',
                  }}
                >
                  Let's go!
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  // Don't render anything until Clerk is loaded (prevents flash)
  if (!isClerkLoaded || !isUserLoaded) {
    return <div className="min-h-screen bg-gradient-to-b from-white to-gray-100" />;
  }

  // Brand gradient for stepper
  const brandGradient = 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)';

  // Get step index for stepper
  const stepOrder = ["account-creation", "plan-selection", "payment-entry", "user-goals", "welcome"];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: '#fcf9fe',
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
      {/* Subtle gradient overlay like landing page */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 5% 50%, rgba(220,208,255,0.4) 0%, transparent 55%),
            radial-gradient(ellipse 70% 80% at 95% 50%, rgba(241,211,255,0.35) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 50% 10%, rgba(197,216,255,0.35) 0%, transparent 55%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 60%)
          `
        }}
      />

      {/* Header with auth button */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
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
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative z-10">
        {/* Modern Stepper */}
        <div className="w-full max-w-md mb-10">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isUpcoming = index > currentStepIndex;

              return (
                <React.Fragment key={step}>
                  {/* Step Circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
                    style={{
                      background: isCompleted || isCurrent ? brandGradient : '#ffffff',
                      color: isCompleted || isCurrent ? '#ffffff' : '#8a7a85',
                      border: isUpcoming ? '2px solid #e5e0e3' : 'none',
                      boxShadow: isCurrent ? '0 4px 12px rgba(97, 42, 79, 0.3)' :
                                 isCompleted ? '0 2px 8px rgba(97, 42, 79, 0.2)' : 'none'
                    }}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>

                  {/* Connector Line */}
                  {index < 4 && (
                    <div
                      className="w-8 h-0.5 rounded-full transition-all duration-300"
                      style={{
                        background: index < currentStepIndex
                          ? brandGradient
                          : '#e5e0e3'
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow;