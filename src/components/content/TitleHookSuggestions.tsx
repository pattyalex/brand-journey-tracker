
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Sparkles, ArrowRight, Plus, Trash2 } from "lucide-react";

interface TitleHookSuggestionsProps {
  onSelectHook: (hook: string) => void;
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
          "Exclusive preview for my followers"
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
        name: "Beauty & Fashion",
        hooks: [
          "The makeup hack every [skin type] needs to know",
          "This styling trick makes any outfit look expensive",
          "How to build a capsule wardrobe that actually works",
          "The skincare ingredient that changed my [skin concern]",
          "Affordable dupes for [luxury product]"
        ]
      },
      {
        name: "Fitness & Wellness",
        hooks: [
          "The X-minute workout that burns more than an hour at the gym",
          "I ate like [celebrity] for a week and here's what happened",
          "The supplement that boosted my [energy/performance/sleep]",
          "How I lost X pounds without giving up [favorite food]",
          "The wellness habit that improved my mental health"
        ]
      }
    ]
  }
};

const TitleHookSuggestions = ({ onSelectHook }: TitleHookSuggestionsProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customHook, setCustomHook] = useState("");
  const [customHooks, setCustomHooks] = useState<string[]>([]);

  useEffect(() => {
    const savedHooks = localStorage.getItem("customHooks");
    if (savedHooks) {
      setCustomHooks(JSON.parse(savedHooks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("customHooks", JSON.stringify(customHooks));
  }, [customHooks]);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSheetOpen(true);
  };

  const handleSelectHook = (hook: string) => {
    onSelectHook(hook);
    setSheetOpen(false);
    setDialogOpen(false);
  };

  const handleCustomHookSubmit = () => {
    if (customHook.trim()) {
      onSelectHook(customHook);
      if (!customHooks.includes(customHook)) {
        setCustomHooks(prev => [...prev, customHook]);
      }
      setCustomHook("");
      setDialogOpen(false);
    }
  };

  const handleViewCustomHooks = () => {
    setSelectedCategory("Create your own");
    setSheetOpen(true);
  };

  const handleDeleteCustomHook = (hookToDelete: string) => {
    setCustomHooks(prev => prev.filter(hook => hook !== hookToDelete));
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Catchy Hook Ideas</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[350px] overflow-y-auto">
            <div className="p-1">
              {Object.keys(HOOK_DATA).map((category, index) => (
                <button
                  key={index}
                  className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-accent text-sm font-medium rounded-sm"
                  onClick={() => handleSelectCategory(category)}
                >
                  {category}
                  <ArrowRight className="h-4 w-4 ml-2 text-muted-foreground" />
                </button>
              ))}
              
              <button
                className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-accent text-sm font-medium rounded-sm"
                onClick={handleViewCustomHooks}
              >
                Create your own
                <ArrowRight className="h-4 w-4 ml-2 text-muted-foreground" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[400px] p-0 overflow-y-auto">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{selectedCategory}</SheetTitle>
          </SheetHeader>
          
          <div className="p-4">
            {selectedCategory && selectedCategory !== "Create your own" && 
              HOOK_DATA[selectedCategory as keyof typeof HOOK_DATA]?.subcategories.map((subcat, scIndex) => (
                <div key={scIndex} className="mb-8">
                  <h3 className="font-bold text-lg mb-3 text-primary">{subcat.name}</h3>
                  <ul className="space-y-2.5 ml-4">
                    {subcat.hooks.map((hook, hIndex) => (
                      <li key={hIndex} className="list-disc ml-4">
                        <button 
                          onClick={() => handleSelectHook(hook)}
                          className="text-left hover:text-primary hover:underline"
                        >
                          "{hook}"
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            }
            
            {selectedCategory === "Create your own" && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg mb-3 text-primary">Your Custom Hooks</h3>
                  
                  <div className="flex items-center gap-2 mt-2 mb-4 w-full">
                    <Input
                      type="text"
                      value={customHook}
                      onChange={(e) => setCustomHook(e.target.value)}
                      className="flex-1"
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
                      className="bg-[#c4b7a6] hover:bg-[#b0a48f] text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {customHooks.length > 0 ? (
                  <ul className="space-y-2.5">
                    {customHooks.map((hook, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="list-disc ml-4">
                          <button 
                            onClick={() => handleSelectHook(hook)}
                            className="text-left hover:text-primary hover:underline"
                          >
                            "{hook}"
                          </button>
                        </span>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomHook(hook);
                          }}
                          className="ml-auto p-1 h-6 w-6"
                          aria-label={`Delete hook "${hook}"`}
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">No custom hooks added yet.</p>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TitleHookSuggestions;
