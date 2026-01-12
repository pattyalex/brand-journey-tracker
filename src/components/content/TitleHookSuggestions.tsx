import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, ArrowRight, Plus, Trash2, ChevronLeft } from "lucide-react";
import { StorageKeys, getString, setString } from "@/lib/storage";

interface TitleHookSuggestionsProps {
  onSelectHook: (hook: string) => void;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

const HOOK_DATA = {
  "Inspirational Hooks": {
    subcategories: [
      {
        name: "Motivational & Inspirational Hooks",
        hooks: [
          "If you're struggling with [X], read this.",
          "You're closer than you think to [X].",
          "This one mindset shift changed everything for me.",
          "You deserve to feel confident in your own skin!",
          "Don't let anyone tell you [X] is out of your reach.",
          "Style is all about expressing yourself—here's how.",
          "It's not about following trends, it's about creating your own.",
          "Stop overthinking your outfits—it's all about confidence!"
        ]
      },
      {
        name: "Mindset Shift Hooks",
        hooks: [
          "You don't need [X], you need [Y].",
          "The way you think about [X] is holding you back.",
          "Stop doing [X] if you want [Y].",
          "Beauty doesn't have to be expensive—here's how I make it work.",
          "It's not about following trends, it's about creating your own.",
          "Stop overthinking your outfits—it's all about confidence!"
        ]
      },
      {
        name: "Authority & Social Proof Hooks",
        hooks: [
          "What [experts/influencers] know that you don't.",
          "I've helped [X] people do [Y]—here's how.",
          "Top [industry] professionals all swear by this.",
          "Top makeup artists swear by this technique.",
          "My followers are loving this product—it's a must-have!",
          "The secret behind my fashion style? It's simpler than you think."
        ]
      }
    ]
  },
  "Educational Hooks": {
    subcategories: [
      {
        name: "How-To Hooks",
        hooks: [
          "How to [achieve result] in [timeframe]",
          "X simple steps to master [skill]",
          "The beginner's guide to [topic]",
          "Learn how to [task] like a pro",
          "The easiest way to [solve problem]"
        ]
      },
      {
        name: "Knowledge Gaps",
        hooks: [
          "X things you didn't know about [topic]",
          "The truth about [common misconception]",
          "Why everything you know about [topic] is wrong",
          "The hidden science behind [everyday thing]",
          "What they don't tell you about [industry topic]"
        ]
      },
      {
        name: "Problem-Solution Hooks",
        hooks: [
          "Struggling with [X]? Here's the fix!",
          "I stopped doing this ONE thing, and my life changed!",
          "This is why [X] isn't working for you (and how to fix it).",
          "You don't need [X] to [Y]."
        ]
      },
      {
        name: "Quick Tips & Life Hacks Hooks",
        hooks: [
          "Do this one thing and thank me later.",
          "The easiest way to [X]—takes less than 5 minutes!",
          "This tiny hack will change your life.",
          "3 easy ways to level up your wardrobe without spending a dime.",
          "The quickest way to get glowing skin every day.",
          "These 5 beauty products will save you time and money."
        ]
      },
      {
        name: "List & Actionable Tips Hooks",
        hooks: [
          "3 tips that completely changed my life.",
          "2 ways to instantly boost your confidence.",
          "5 things I wish I knew sooner about [X].",
          "The 4-step formula to [achieve goal].",
          "3 things you need to know before [X].",
          "5 mistakes you're making with [X].",
          "The top 10 [X] of all time!",
          "Do these 3 things if you want to [desired outcome].",
          "I tried 7 different methods to [X]—here's what actually worked."
        ]
      },
      {
        name: "Behind-the-Scenes & Insider Info Hooks",
        hooks: [
          "Let me take you behind the scenes of [X].",
          "This is how I REALLY [do X].",
          "What [industry insiders] don't want you to know!"
        ]
      },
      {
        name: "Common Mistakes & Myths Hooks",
        hooks: [
          "You think [X] works? Think again.",
          "Most people get this wrong…",
          "Think you're doing your skincare right? You're probably wrong.",
          "I used to believe this myth until I learned the truth.",
          "This 'fashion tip' is actually a huge mistake!",
          "Don't fall for this [beauty/fashion] myth!"
        ]
      }
    ]
  },
  "Entertaining Hooks": {
    subcategories: [
      {
        name: "Shock & Surprise Hooks",
        hooks: [
          "You won't believe this…",
          "This outfit combo is a game-changer!",
          "No one is talking about this, but…",
          "This is actually a HUGE mistake!",
          "You won't believe this beauty hack…",
          "This trend is taking over and it's not what you think!",
          "I just discovered a game-changing way to wear [X]—you have to try it!",
          "This beauty routine transformed my skin in a week—here's how.",
          "What's the secret behind perfect [hair/skin]?"
        ]
      },
      {
        name: "Curiosity Hooks",
        hooks: [
          "I tried [X] for a week—here's what happened.",
          "Something weird happened when I did this…",
          "Ever wondered why [X]?"
        ]
      },
      {
        name: "Relatable & Personal Hooks",
        hooks: [
          "I used to feel [X], but then I discovered this.",
          "If you've ever felt [X], you're not alone.",
          "This is for anyone who feels stuck right now.",
          "I used to think I couldn't pull off [X], but now I'm obsessed.",
          "Ever feel like you're stuck in a style rut? Here's how I got out of mine.",
          "This beauty routine changed everything for me—I swear by it now."
        ]
      },
      {
        name: "Dramatic Storytelling Hooks",
        hooks: [
          "I was today years old when I learned this.",
          "I thought my life was over until…",
          "Here's how I went from [X] to [Y] in [Z] days."
        ]
      },
      {
        name: "Controversial & Polarizing Hooks",
        hooks: [
          "Unpopular opinion, but…",
          "Stop doing [X] if you want [Y].",
          "Everyone is wrong about [X]!"
        ]
      },
      {
        name: "Question-Based Hooks",
        hooks: [
          "What if I told you [X]?",
          "Did you know you could [X]?",
          "Would you rather [X] or [Y]?",
          "What if I told you you could style [X] in 5 different ways?",
          "Did you know you can wear [X] all year round?",
          "Would you rather invest in a classic piece or go for the latest trend?"
        ]
      },
      {
        name: "FOMO & Call-to-Action Hooks",
        hooks: [
          "You're missing out if you're not doing this.",
          "This won't be available for long!",
          "Only [X] spots left—act fast!",
          "Everyone is doing this—are you?",
          "You NEED to know this before [X]!",
          "This trend is blowing up—don't miss out!",
          "This limited-edition item is almost sold out!",
          "You won't want to miss this new release—[X] is finally here!",
          "Get this look before it's gone—limited stock available!"
        ]
      }
    ]
  },
  "Promotional Hooks": {
    subcategories: [
      {
        name: "Limited Time Offers",
        hooks: [
          "Last chance: [offer] ends tonight",
          "24 hours only: Get [product] before it's gone",
          "Flash sale alert: [discount] off everything",
          "Special announcement: [new product/service] is here",
          "Exclusive preview for my followers",
          "Treat yourself to [X]—you deserve it!",
          "Shop now and get [X]% off your first purchase!",
          "Limited-time offer: Get [X] free when you buy [Y]!",
          "This deal ends in [X] hours—don't miss out!",
          "Only [X] items left in stock!",
          "Pre-order now and be the first to [X]!",
          "Get [Y] when you sign up today!"
        ]
      },
      {
        name: "Problem-Solution Hooks",
        hooks: [
          "Tired of [problem]? This [product/solution] changed everything",
          "Never worry about [pain point] again",
          "The only [product] you'll need for [result]",
          "How I finally solved my [problem] with this simple [solution]",
          "Transform your [area] with this game-changing [product]"
        ]
      }
    ]
  },
  "Industry Specific Hooks": {
    subcategories: [
      {
        name: "Fashion Hooks",
        hooks: [
          "The must-have item of the season is [X].",
          "This season's hottest trend is easier to style than you think!",
          "I've been living in [X]—here's why you need it in your wardrobe.",
          "Get my signature look in just 3 pieces!"
        ]
      },
      {
        name: "Beauty Hooks",
        hooks: [
          "The one product I can't live without—find out why!",
          "Transform your skin with this [X] step routine.",
          "This beauty tool will change your skincare game.",
          "I've been using this product for a week—and the results are insane!"
        ]
      },
      {
        name: "Lifestyle Hooks",
        hooks: [
          "My morning routine that sets me up for success.",
          "How I balance work, life, and everything in between.",
          "My favorite ways to relax after a busy day.",
          "This [lifestyle habit] has made a huge impact on my life."
        ]
      },
      {
        name: "Health & Fitness",
        hooks: [
          "The secret to getting stronger without spending hours at the gym.",
          "This quick 10-minute workout is all you need.",
          "Transform your body with this simple routine.",
          "You won't believe the benefits of this one exercise!",
          "How I stay fit without stressing about the gym.",
          "This one food changed my energy levels completely.",
          "The best-kept secret for glowing skin: [X]!",
          "My go-to meal prep for a busy week.",
          "Get glowing skin with these easy food swaps.",
          "This is how I eat healthy while traveling."
        ]
      },
      {
        name: "Travel & Experiences",
        hooks: [
          "The top 5 destinations you NEED to visit in 2025.",
          "Why [X] is the perfect vacation destination for [Y].",
          "These travel hacks will save you hours at the airport.",
          "Pack smarter with these must-have travel accessories.",
          "The ultimate travel guide to [destination].",
          "This activity will give you the ultimate adrenaline rush.",
          "The best hidden gems for travelers who want something unique.",
          "How to explore [destination] like a local.",
          "Here's what it's really like to hike [famous mountain]."
        ]
      },
      {
        name: "Personal Finance & Investing",
        hooks: [
          "The #1 mistake people make when managing money (and how to fix it).",
          "Here's how I saved $X in 6 months—without sacrificing anything.",
          "Why you should start investing today—even with a small amount.",
          "3 simple tips to start budgeting effectively.",
          "The best apps to track your spending and save money.",
          "How I started investing and made my first $X.",
          "The safest way to start building wealth in your 20s/30s.",
          "I turned $X into $Y by making these smart investments.",
          "Stop waiting—here's why you need to invest in real estate now.",
          "The secret to financial freedom? Consistency and [X]."
        ]
      },
      {
        name: "Home Decor & Interior Design",
        hooks: [
          "Transform any room with this one design tip.",
          "This season's must-have decor items for your home.",
          "5 ways to create a cozy, stylish living space on a budget.",
          "Why [X] is the perfect statement piece for any room.",
          "Create a luxury vibe in your home with these affordable tips.",
          "This DIY project will give your home a complete makeover.",
          "Organize your space with these genius hacks.",
          "How I decluttered my home in just one weekend.",
          "Get your home ready for guests with these quick and easy fixes."
        ]
      },
      {
        name: "Technology & Gadgets",
        hooks: [
          "This gadget will change the way you work from home.",
          "How I use [tech product] to make my life easier every day.",
          "Top 5 apps to make you more productive.",
          "This one feature of [X] makes it my favorite gadget.",
          "Here's why you need [tech product] in your life.",
          "The future of tech is here—here's what to expect.",
          "Why [X] is the next big thing in the tech world.",
          "How AI is going to revolutionize your daily life.",
          "Everything you need to know about the new [X] gadget."
        ]
      },
      {
        name: "Parenting & Family",
        hooks: [
          "How I keep my kids entertained without screen time.",
          "The ultimate guide to creating a peaceful bedtime routine.",
          "How to balance work and parenting without losing your mind.",
          "Parenting hacks every mom needs to know.",
          "Why [X] parenting method works better than the others.",
          "How to create family memories that will last a lifetime.",
          "Best family vacation destinations for 2025.",
          "Here's how we make family dinner time fun and engaging.",
          "How we organize our home to fit everyone's needs."
        ]
      },
      {
        name: "Career & Professional Development",
        hooks: [
          "How to level up your career and get noticed by top companies.",
          "The best advice I ever received when starting my career.",
          "3 things I wish I knew before going into [industry].",
          "Why networking is the key to growing your career.",
          "How I landed my dream job in [X] industry.",
          "The first thing you need to do before starting a business.",
          "Why [X] business model is the future.",
          "5 mistakes I made when starting my business and how to avoid them.",
          "What I wish I knew before becoming an entrepreneur.",
          "How to find your niche and build a business around it."
        ]
      },
      {
        name: "Education & Learning",
        hooks: [
          "This one method helped me learn [X] in half the time.",
          "Top 5 online courses to take in [X] field.",
          "How I study effectively without getting overwhelmed.",
          "The best apps to help you learn something new every day.",
          "This technique will improve your concentration instantly.",
          "How to develop a growth mindset and change your life.",
          "The best way to set goals that actually stick.",
          "Stop procrastinating and start achieving with these 3 simple steps.",
          "This productivity hack will make your day 10x more efficient."
        ]
      },
      {
        name: "Food & Cooking",
        hooks: [
          "This 5-ingredient recipe is all you need for dinner tonight.",
          "My go-to healthy recipe for busy weekdays.",
          "How to cook [X] in under 20 minutes.",
          "Make dinner easier with these 3 simple hacks.",
          "The one kitchen gadget that saves me hours every week.",
          "The latest food trend everyone's talking about.",
          "Why you need to try [X] before it's everywhere.",
          "This food trend is going to blow your mind.",
          "The healthiest (and most delicious) trend this year."
        ]
      }
    ]
  }
};

const TitleHookSuggestions = ({
  onSelectHook,
  externalOpen,
  onExternalOpenChange,
}: TitleHookSuggestionsProps) => {
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [hookSelectionDialogOpen, setHookSelectionDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customHook, setCustomHook] = useState("");
  const [customHooks, setCustomHooks] = useState<string[]>([]);

  // Use external control if provided, otherwise use internal state
  const dialogOpen = externalOpen !== undefined ? externalOpen : internalDialogOpen;
  const setDialogOpen = onExternalOpenChange || setInternalDialogOpen;

  useEffect(() => {
    const savedHooks = getString(StorageKeys.customHooks);
    if (savedHooks) {
      setCustomHooks(JSON.parse(savedHooks));
    }
  }, []);

  useEffect(() => {
    setString(StorageKeys.customHooks, JSON.stringify(customHooks));
  }, [customHooks]);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setDialogOpen(false);
    setHookSelectionDialogOpen(true);
  };

  const handleSelectHook = (hook: string) => {
    onSelectHook(hook);
    setHookSelectionDialogOpen(false);
    setDialogOpen(false);
  };

  const handleBackToCategories = () => {
    setHookSelectionDialogOpen(false);
    setDialogOpen(true);
  };

  const handleDeleteCustomHook = (hookToDelete: string) => {
    setCustomHooks(prev => prev.filter(hook => hook !== hookToDelete));
  };

  const handleCustomHookSubmit = () => {
    if (customHook.trim()) {
      onSelectHook(customHook);
      if (!customHooks.includes(customHook)) {
        setCustomHooks(prev => [...prev, customHook]);
      }
      setCustomHook("");
      setDialogOpen(false);
      setHookSelectionDialogOpen(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="xs"
        className="absolute right-[23px] hover:bg-transparent active:scale-95 transition-all duration-150 p-1.5 h-auto"
        onClick={() => setDialogOpen(true)}
        aria-label="Show title hook suggestions"
      >
        <Sparkles className="h-5 w-5 text-primary" />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] border border-gray-200 flex flex-col overflow-hidden">
          <DialogHeader className="border-b border-gray-100 pb-4 flex-shrink-0">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-3 text-base mb-4">
              <button
                onClick={() => setDialogOpen(false)}
                className="text-gray-500 hover:text-blue-600 transition-colors font-medium"
              >
                Production
              </button>
              <span className="text-gray-400">/</span>
              <button
                onClick={() => setDialogOpen(false)}
                className="text-gray-500 hover:text-blue-600 transition-colors font-medium"
              >
                Content Ideation
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-semibold">Trending Hooks</span>
            </div>

            <DialogTitle className="text-2xl font-bold text-gray-900 mb-3">Hook Library</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Browse hundreds of proven hooks organized by category</p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="grid grid-cols-1 gap-3 px-2">
              {/* Inspirational Hooks */}
              <button
                onClick={() => handleSelectCategory("Inspirational Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-lg group-hover:bg-purple-100 transition-colors">
                    ⭐
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Inspirational Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Motivate and inspire your audience</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Educational Hooks */}
              <button
                onClick={() => handleSelectCategory("Educational Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-lg group-hover:bg-emerald-100 transition-colors">
                    📚
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Educational Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Teach and share knowledge</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Entertaining Hooks */}
              <button
                onClick={() => handleSelectCategory("Entertaining Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-lg group-hover:bg-rose-100 transition-colors">
                    🎭
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Entertaining Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Captivate with stories and surprises</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Promotional Hooks */}
              <button
                onClick={() => handleSelectCategory("Promotional Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-lg group-hover:bg-amber-100 transition-colors">
                    💰
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Promotional Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Drive sales and conversions</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Industry Specific Hooks */}
              <button
                onClick={() => handleSelectCategory("Industry Specific Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-lg group-hover:bg-sky-100 transition-colors">
                    🎯
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Industry Specific Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Tailored for your niche</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Create your own */}
              <button
                onClick={() => {
                  setSelectedCategory("Create your own");
                  setDialogOpen(false);
                  setHookSelectionDialogOpen(true);
                }}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg group-hover:bg-gray-200 transition-colors">
                    ✍️
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Create your own</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Write and save custom hooks</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={hookSelectionDialogOpen} onOpenChange={setHookSelectionDialogOpen}>
        <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] flex flex-col border border-gray-200 overflow-hidden">
          <DialogHeader className="border-b border-gray-100 pb-4 flex-shrink-0">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-3 text-base mb-4">
              <button
                onClick={() => {
                  setHookSelectionDialogOpen(false);
                  setDialogOpen(false);
                }}
                className="text-gray-500 hover:text-blue-600 transition-colors font-medium"
              >
                Production
              </button>
              <span className="text-gray-400">/</span>
              <button
                onClick={() => {
                  setHookSelectionDialogOpen(false);
                  setDialogOpen(false);
                }}
                className="text-gray-500 hover:text-blue-600 transition-colors font-medium"
              >
                Content Ideation
              </button>
              <span className="text-gray-400">/</span>
              <button
                onClick={() => handleBackToCategories()}
                className="text-gray-500 hover:text-blue-600 transition-colors font-medium"
              >
                Trending Hooks
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-semibold">{selectedCategory}</span>
            </div>

            <DialogTitle className="text-2xl font-bold text-gray-900 mb-3">{selectedCategory}</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Click any hook to add it to your ideate column</p>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 py-4">
            {selectedCategory && selectedCategory !== "Create your own" &&
              HOOK_DATA[selectedCategory as keyof typeof HOOK_DATA]?.subcategories.map((subcat, scIndex) => (
                <div key={scIndex} className="mb-8 px-2">
                  <h3 className="font-semibold text-base text-gray-900 mb-3 px-3">{subcat.name}</h3>
                  <div className="space-y-2">
                    {subcat.hooks.map((hook, hIndex) => (
                      <button
                        key={hIndex}
                        onClick={() => handleSelectHook(hook)}
                        className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-150 hover:shadow-sm group"
                      >
                        <p className="text-sm text-gray-700 group-hover:text-gray-900">
                          "{hook}"
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            }
            
            {selectedCategory === "Create your own" && (
              <div className="px-2">
                <div className="mb-6">
                  <h3 className="font-semibold text-base text-gray-900 mb-3 px-3">Your Custom Hooks</h3>

                  <div className="flex items-center gap-2 mb-6 px-3">
                    <Input
                      type="text"
                      value={customHook}
                      onChange={(e) => setCustomHook(e.target.value)}
                      className="flex-1 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                      placeholder="Type your own hook..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customHook.trim()) {
                            setCustomHooks(prev => [...prev, customHook]);
                            setCustomHook("");
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (customHook.trim()) {
                          setCustomHooks(prev => [...prev, customHook]);
                          setCustomHook("");
                        }
                      }}
                      disabled={!customHook.trim()}
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {customHooks.length > 0 ? (
                    <div className="space-y-2">
                      {customHooks.map((hook, index) => (
                        <div key={index} className="relative group">
                          <button
                            onClick={() => handleSelectHook(hook)}
                            className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-150 hover:shadow-sm pr-12"
                          >
                            <p className="text-sm text-gray-700 group-hover:text-gray-900">
                              "{hook}"
                            </p>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomHook(hook);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                            aria-label={`Delete hook "${hook}"`}
                          >
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm px-3">No custom hooks added yet. Create your first one above!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TitleHookSuggestions;
