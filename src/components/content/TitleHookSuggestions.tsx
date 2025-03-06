import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Sparkles, ArrowRight } from "lucide-react";

interface TitleHookSuggestionsProps {
  onSelectHook: (hook: string) => void;
}

// Categories with detailed hook ideas
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
      }
    ]
  },
  "Entertaining Hooks": {
    subcategories: [
      {
        name: "Story Hooks",
        hooks: [
          "The day everything changed for my [business/life]",
          "I tried [trendy thing] for a week and here's what happened",
          "My biggest [failure/mistake] and what I learned",
          "Behind the scenes of [interesting process]",
          "What a day in my life really looks like"
        ]
      },
      {
        name: "Curiosity Hooks",
        hooks: [
          "The strange trick that [solved my problem]",
          "You won't believe what happened when I [action]",
          "This changes everything I thought about [topic]",
          "The surprising truth about [common belief]",
          "What I discovered after [time period] of [activity]"
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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customHook, setCustomHook] = useState("");

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSheetOpen(true);
  };

  const handleSelectHook = (hook: string) => {
    onSelectHook(hook);
    setSheetOpen(false);
    setPopoverOpen(false);
  };

  const handleCustomHookSubmit = () => {
    if (customHook.trim()) {
      onSelectHook(customHook);
      setCustomHook("");
      setPopoverOpen(false);
    }
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="xs"
            className="absolute right-[23px] hover:bg-transparent active:scale-95 transition-all duration-150 p-1.5 h-auto"
            aria-label="Show title hook suggestions"
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="flex flex-col">
            <div className="p-3 bg-muted/50 border-b">
              <h3 className="font-medium text-sm">Catchy Hook Ideas</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Click on any category for hook ideas
              </p>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              <div className="p-1">
                {Object.keys(HOOK_DATA).map((category, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-between px-3 py-2 h-auto text-sm rounded-none hover:bg-accent"
                    onClick={() => handleSelectCategory(category)}
                  >
                    {category}
                    <ArrowRight className="h-4 w-4 ml-2 text-muted-foreground" />
                  </Button>
                ))}
              </div>
              
              <div className="p-1">
                <h4 className="font-semibold text-sm px-3 py-2 text-primary">+ Create your own</h4>
                <div className="px-3 py-2 flex gap-2">
                  <input
                    type="text"
                    value={customHook}
                    onChange={(e) => setCustomHook(e.target.value)}
                    className="flex-1 px-3 py-1 text-sm border rounded-md"
                    placeholder="Type a name for your own category of hooks..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCustomHookSubmit();
                    }}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleCustomHookSubmit}
                    disabled={!customHook.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[400px] p-0 overflow-y-auto">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{selectedCategory}</SheetTitle>
          </SheetHeader>
          
          <div className="p-4">
            {selectedCategory && HOOK_DATA[selectedCategory as keyof typeof HOOK_DATA]?.subcategories.map((subcat, scIndex) => (
              <div key={scIndex} className="mb-6">
                <h3 className="font-medium text-base mb-2">• {subcat.name}</h3>
                <ul className="pl-6 space-y-2">
                  {subcat.hooks.map((hook, hIndex) => (
                    <li key={hIndex} className="text-sm list-[circle]">
                      <button 
                        onClick={() => handleSelectHook(hook)}
                        className="text-left hover:text-primary hover:underline w-full"
                      >
                        "{hook}"
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TitleHookSuggestions;
