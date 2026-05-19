import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Plus, Trash2, ArrowLeft, Sparkles, GraduationCap, PartyPopper, Megaphone, Target, PenTool, ShieldOff, Heart } from "lucide-react";
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
          "Get my signature look in just 3 pieces!",
          "Three pieces I'd buy again if my closet burned down tomorrow.",
          "Stop dressing for the woman you used to be.",
          "If you only own one [item type], make it this one.",
          "What I wear when I want to be taken seriously.",
          "The reason your outfits look almost right is one styling principle nobody teaches.",
          "I stopped buying [common item] last year. Here's what replaced it.",
          "The difference between expensive-looking and actually expensive is one detail.",
          "If your closet had a voice, what would it say about you?",
          "Outfit autopsy: why this look isn't working.",
          "A capsule wardrobe for the woman who's done explaining herself.",
          "The piece every well-dressed woman owns and never mentions.",
          "How to know if a trend is worth your money or a waste of it."
        ]
      },
      {
        name: "Beauty Hooks",
        hooks: [
          "The one product I can't live without—find out why!",
          "Transform your skin with this [X] step routine.",
          "This beauty tool will change your skincare game.",
          "I've been using this product for a week—and the results are insane!",
          "The product I'd keep if I could only keep one.",
          "Three products I stopped buying after I learned how skin actually works.",
          "Why your skincare isn't working has nothing to do with your products.",
          "My five minute routine for the days I have to look like I tried.",
          "The makeup I wear when I need to be the most credible person in the room.",
          "Stop chasing every viral product. Here's what to look for instead.",
          "I cut my routine in half and my skin got better. Here's what I dropped.",
          "Skincare for the woman who doesn't have time for ten steps.",
          "The skincare myth I believed for ten years and finally let go of.",
          "If your skin looks tired, it's not your moisturizer. It's [specific overlooked thing]."
        ]
      },
      {
        name: "Lifestyle Hooks",
        hooks: [
          "My morning routine that sets me up for success.",
          "How I balance work, life, and everything in between.",
          "My favorite ways to relax after a busy day.",
          "This [lifestyle habit] has made a huge impact on my life.",
          "My morning routine has nothing to do with productivity. Here's what it actually does.",
          "I stopped trying to balance work and life. Here's what I do instead.",
          "The lifestyle habit that made the biggest difference in my work is the most boring one.",
          "If your evenings feel chaotic, it's not your habits. It's that you never closed the day.",
          "Why my morning starts at 9am, not 5am, and I'm still ahead.",
          "Romanticizing my life as a [profession] so I don't lose myself along the way.",
          "I gave up [popular habit] and got my time back. Here's what it cost me.",
          "My version of high-performance looks nothing like the internet's version."
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
          "This is how I eat healthy while traveling.",
          "The exercise I was doing wrong for years and the one cue that fixed it.",
          "I stopped working out every day and got in better shape. Here's why.",
          "What nobody tells you about fitness after [age].",
          "The supplement I dropped that was actually making things worse.",
          "My recovery routine matters more than my workout. Here's what I do."
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
          "Here's what it's really like to hike [famous mountain].",
          "The one thing I always pack that most people forget.",
          "I planned this entire trip on a $[X] budget. Here's the breakdown.",
          "The destination I'll never recommend even though everyone loves it.",
          "How I travel with just a carry-on for any length of trip.",
          "The travel mistake I keep seeing and how to avoid it."
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
          "The secret to financial freedom? Consistency and [X].",
          "The money rule I broke on purpose and why it paid off.",
          "I automated my finances in one afternoon. Here's the exact setup.",
          "The financial advice that sounds smart but keeps people broke.",
          "What I'd tell my [younger age] self about money in one sentence.",
          "The subscription I cancelled that was quietly draining my budget."
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
          "Get your home ready for guests with these quick and easy fixes.",
          "The one thing interior designers always remove from a room first.",
          "My home looks expensive but this room cost under $[X] to style.",
          "The design mistake in almost every living room and the easy fix.",
          "Stop decorating around furniture you don't even like.",
          "The lighting trick that makes any space feel twice as expensive."
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
          "Everything you need to know about the new [X] gadget.",
          "I replaced [expensive tool] with this $[X] alternative and noticed no difference.",
          "The one setting on your phone you should change right now.",
          "The tech I actually use every day versus what collects dust.",
          "I tried the most hyped gadget of the year. Here's my honest take.",
          "The digital habit I quit that gave me back two hours a day."
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
          "How we organize our home to fit everyone's needs.",
          "The parenting advice I ignored and wish I hadn't.",
          "What I stopped saying to my kids that changed everything.",
          "The one boundary I set that made our household calmer overnight.",
          "I let my kid make this decision and here's what happened.",
          "The phase I thought would never end and what got us through it."
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
          "How to find your niche and build a business around it.",
          "The career move everyone called risky that changed my trajectory.",
          "What I stopped putting on my resume that actually got me more interviews.",
          "The skill nobody lists on LinkedIn that matters more than any certification.",
          "I said no to a promotion and here's why it was the smartest thing I did.",
          "The real reason you're not getting hired has nothing to do with your experience."
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
          "This productivity hack will make your day 10x more efficient.",
          "The learning method school never taught you that actually sticks.",
          "I read [X] books this year. Only these five were worth finishing.",
          "The note-taking system that finally made information stick for me.",
          "Stop consuming content and start doing this instead.",
          "The one mental model that changed how I make every decision."
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
          "The healthiest (and most delicious) trend this year.",
          "The pantry staple I use in almost every meal that nobody talks about.",
          "I stopped following recipes and started cooking like this instead.",
          "The cooking shortcut professional chefs use that home cooks skip.",
          "One grocery swap that upgraded every meal I make.",
          "The dish I was overcooking for years and the two-minute fix."
        ]
      },
      {
        name: "Entrepreneurs & Founders",
        hooks: [
          "The real reason most businesses fail has nothing to do with the product.",
          "I made $[X] in my first year and almost quit anyway. Here's why.",
          "The advice every founder gets that you should absolutely ignore.",
          "Stop building in private. Here's what happens when you build out loud.",
          "The hire I made too late that would have saved me six months.",
          "Nobody talks about the loneliest part of running a business.",
          "I bootstrapped to $[X] with no audience. Here's the actual playbook.",
          "The metric I obsessed over that was killing my growth.",
          "What I'd do differently if I started my business today with zero followers.",
          "Your business doesn't need more strategy. It needs one decision you keep avoiding.",
          "The unsexy task I do every Monday that keeps my business profitable.",
          "I turned down funding and it was the best business decision I ever made.",
          "The founder trap nobody warns you about until you're already in it.",
          "My business almost died at $[X] revenue. Here's the pivot that saved it.",
          "The difference between a side hustle and a real business is one uncomfortable conversation."
        ]
      }
    ]
  },
  "Reverse-Psychology Hooks": {
    subcategories: [
      {
        name: "Identity & Belief Challenges",
        hooks: [
          "Don't watch this if [identity / belief the viewer holds].",
          "Stop scrolling. Actually, keep scrolling if you're [identity], this isn't for you.",
          "Unfollow me right now if you [behavior or belief].",
          "Skip this video if you're already [achieved outcome].",
          "Keep scrolling if you want to stay where you are.",
          "This video isn't for [identity]. It's for [smaller, more specific identity].",
          "Block me if you're still doing [outdated behavior]."
        ]
      },
      {
        name: "Forbidden Knowledge & Secrecy",
        hooks: [
          "I probably shouldn't post this.",
          "Don't tell anyone I told you this.",
          "This is going to upset some people.",
          "I'm going to get hate for this, but [statement].",
          "Don't read this until you're ready to [hard truth].",
          "Don't quote me on this, but [counterintuitive claim].",
          "This is the corner of the internet you weren't supposed to find.",
          "Don't share this with [specific group]. They'll ruin it."
        ]
      },
      {
        name: "Reverse Motivation & Dares",
        hooks: [
          "Ignore this if you actually like [common behavior].",
          "99% of [audience] won't do this. Stay in the 99% if [reason].",
          "Most people shouldn't start a [thing]. Here's how to know if you should.",
          "Don't try to [common goal] until you've [counterintuitive prerequisite].",
          "I dare you to try this for [time period] and tell me it didn't work.",
          "You won't believe me. That's fine. Try it anyway.",
          "Everyone says this is the wrong way to do it. I've made [outcome] doing it anyway."
        ]
      },
      {
        name: "Tough Love & Hard Truths",
        hooks: [
          "I'm not going to explain this twice, so leave now if you're not serious.",
          "Don't save this. You won't use it anyway.",
          "Save this and ignore it like you do everything else.",
          "If you're easily offended by the truth about [topic], swipe up.",
          "You're not ready for this video. Come back in a year.",
          "You're not going to like this, but you already know it's true.",
          "Look away if you're sensitive about [topic].",
          "If you came here for [thing audience expects], you're going to hate the next 30 seconds."
        ]
      },
      {
        name: "Scarcity & Gatekeeping",
        hooks: [
          "I'm taking this down in 24 hours. Watch now or don't.",
          "I should be charging for this. I probably will after this post.",
          "Comments are off for this one. I'm not arguing about it.",
          "I'm gatekeeping this from now on. Last time I'm saying it out loud.",
          "Most of you are going to scroll past this. That's fine, it's not for you.",
          "I'm only saying this once. Save the video or take notes.",
          "I'm going to regret saying this out loud, but [truth]."
        ]
      }
    ]
  },
  "Emotion-Driven Hooks": {
    subcategories: [
      {
        name: "Relatable Hooks",
        hooks: [
          "The biggest lie we've normalized is [statement].",
          "Can we agree to reject the idea that [common belief]?",
          "Something about [topic] doesn't sit right with me.",
          "This might ruin [thing] for you but [revelation].",
          "Why does nobody talk about how [relatable experience] actually feels?",
          "I know I'm not the only one who pretends to be fine with [situation].",
          "We need to stop acting like [common behavior] is normal.",
          "The part of [experience] nobody prepares you for.",
          "Tell me you're a [identity] without telling me you're a [identity].",
          "If this doesn't describe your [day/week/life], I don't believe you.",
          "POV: You finally admitted to yourself that [uncomfortable truth].",
          "Raise your hand if you've ever been personally victimized by [relatable thing].",
          "The unspoken rule of [industry/life stage] that everyone follows but nobody admits.",
          "This is the most accurate thing I've ever said about [topic].",
          "I finally have words for the feeling of [relatable experience]."
        ]
      },
      {
        name: "Vulnerable Hooks",
        hooks: [
          "This isn't easy to say but [confession].",
          "This is probably going to make me sound weak but [truth].",
          "This is me calling myself out in real time.",
          "I've been pretending I'm okay with [situation] but I'm not.",
          "Here's something I've never told anyone publicly.",
          "I almost didn't post this because [fear].",
          "The version of me you see online isn't the full picture.",
          "I failed at [thing] and I need to talk about it.",
          "This is the hardest lesson I've learned this year.",
          "I spent [time period] hiding this part of my journey.",
          "The thing I'm most afraid of people knowing about me is [truth].",
          "I don't have it figured out. Here's what I do have.",
          "I cried about this last week and now I'm posting about it.",
          "Behind every confident post is [vulnerable reality].",
          "I'm sharing this before I talk myself out of it."
        ]
      },
      {
        name: "Controversial Hooks",
        hooks: [
          "I can't be the only one who got the ick from [thing].",
          "I'm just going to say what everyone's thinking.",
          "This opinion lost me followers last time. I'm saying it again.",
          "Hot take: [widely accepted thing] is actually [opposite opinion].",
          "I don't care if this is unpopular — [bold statement].",
          "The [industry] is lying to you about [topic] and here's proof.",
          "I'm tired of pretending [common practice] actually works.",
          "Name one reason [popular thing] deserves the hype. I'll wait.",
          "This is the hill I will die on: [strong opinion].",
          "Everyone loves [thing] and I genuinely don't understand why.",
          "I said this once and got dragged. Let me explain why I still believe it.",
          "The reason [popular creator/brand] won't say this out loud is [reason].",
          "If [bold claim] offends you, you might be the problem.",
          "We romanticize [thing] way too much. Here's the reality.",
          "Go ahead and unfollow me for this but [statement]."
        ]
      },
      {
        name: "Urgency-Driven Hooks",
        hooks: [
          "This is your sign to stop waiting and start doing.",
          "Do this now before you find a way to talk yourself out of it.",
          "This is the quickest way to [desired outcome].",
          "You have 24 hours to act on this or you'll forget it forever.",
          "Stop saving posts and start doing what they say.",
          "The window for [opportunity] is closing faster than you think.",
          "If you've been putting off [action], today is the day.",
          "You don't need more information. You need to start.",
          "Every day you wait is a day you could have been [result].",
          "Future you is begging present you to do this right now.",
          "Set a timer for 10 minutes and just start. That's it.",
          "The best time to start was yesterday. The second best time is this video.",
          "You're one decision away from a completely different [life/business/routine].",
          "This is the push you've been waiting for. No more excuses.",
          "If not now, when? Because 'later' isn't a real time."
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
  const [selectedIndustry, setSelectedIndustry] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState(0);

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
    setSelectedIndustry(0);
    setSelectedEmotion(0);
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] flex flex-col border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-[#FEF8F6] via-[#FFFCFB] to-[#FDF2EE]">
          <DialogHeader className="flex-shrink-0 px-8 pt-6">
            {/* Back Button */}
            <button
              onClick={() => setDialogOpen(false)}
              className="flex items-center gap-2 text-gray-400 hover:text-[#E07A5F] transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="mb-2">
              <DialogTitle className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Hook Library</DialogTitle>
            </div>
            <p className="text-sm text-gray-500">Browse hundreds of proven hooks organized by category</p>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-8 pb-6">
            <div className="grid grid-cols-1 gap-3">
              {/* Inspirational Hooks */}
              <button
                onClick={() => handleSelectCategory("Inspirational Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E9E0F5] to-[#D4C6EB] rounded-xl flex items-center justify-center group-hover:from-[#DED2F0] group-hover:to-[#C8B8E5] transition-all shadow-sm">
                    <Sparkles className="w-5 h-5 text-[#7B5BA0]" />
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
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4EBE0] to-[#B8DBC8] rounded-xl flex items-center justify-center group-hover:from-[#C6E4D6] group-hover:to-[#A8D0BA] transition-all shadow-sm">
                    <GraduationCap className="w-5 h-5 text-[#3D7A5C]" />
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
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FCE4E8] to-[#F5C6D0] rounded-xl flex items-center justify-center group-hover:from-[#F8D6DC] group-hover:to-[#F0B4C2] transition-all shadow-sm">
                    <PartyPopper className="w-5 h-5 text-[#C4607A]" />
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
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FEF0DC] to-[#FADDB4] rounded-xl flex items-center justify-center group-hover:from-[#FCE8CC] group-hover:to-[#F6D0A0] transition-all shadow-sm">
                    <Megaphone className="w-5 h-5 text-[#C4882A]" />
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
                  <div className="w-10 h-10 bg-gradient-to-br from-[#DCEAF8] to-[#B8D4F0] rounded-xl flex items-center justify-center group-hover:from-[#CEE0F4] group-hover:to-[#A8C8EA] transition-all shadow-sm">
                    <Target className="w-5 h-5 text-[#4A7EB8]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Industry Specific Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Tailored for your niche</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Reverse-Psychology Hooks */}
              <button
                onClick={() => handleSelectCategory("Reverse-Psychology Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F5E0E0] to-[#E8C4C4] rounded-xl flex items-center justify-center group-hover:from-[#F0D4D4] group-hover:to-[#E0B4B4] transition-all shadow-sm">
                    <ShieldOff className="w-5 h-5 text-[#A0525B]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Reverse-Psychology Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Challenge and provoke curiosity</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Emotion-Driven Hooks */}
              <button
                onClick={() => handleSelectCategory("Emotion-Driven Hooks")}
                className="group w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F5E0F0] to-[#E8C4E0] rounded-xl flex items-center justify-center group-hover:from-[#F0D4EA] group-hover:to-[#E0B4D6] transition-all shadow-sm">
                    <Heart className="w-5 h-5 text-[#A0527B]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-base">Emotion-Driven Hooks</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Relatable, vulnerable, controversial & urgent</p>
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
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F0EBE6] to-[#E0D6CC] rounded-xl flex items-center justify-center group-hover:from-[#E8E0D8] group-hover:to-[#D6C8BC] transition-all shadow-sm">
                    <PenTool className="w-5 h-5 text-[#8B7355]" />
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
        <DialogContent className="h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] sm:max-w-[900px] flex flex-col border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-[#FEF8F6] via-[#FFFCFB] to-[#FDF2EE]">
          <DialogHeader className="flex-shrink-0 px-8 pt-6">
            {/* Back Button */}
            <button
              onClick={() => handleBackToCategories()}
              className="flex items-center gap-2 text-gray-400 hover:text-[#E07A5F] transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="mb-2">
              <DialogTitle className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>{selectedCategory}</DialogTitle>
            </div>
            <p className="text-sm text-gray-500">Click any hook to add it to your ideate column</p>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-8 py-6">
            {selectedCategory && selectedCategory !== "Create your own" && selectedCategory !== "Industry Specific Hooks" && selectedCategory !== "Emotion-Driven Hooks" &&
              HOOK_DATA[selectedCategory as keyof typeof HOOK_DATA]?.subcategories.map((subcat, scIndex) => (
                <div key={scIndex} className="mb-8">
                  <h3 className="font-semibold text-base text-gray-700 mb-3">{subcat.name}</h3>
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

            {selectedCategory === "Industry Specific Hooks" && (() => {
              const subcats = HOOK_DATA["Industry Specific Hooks"].subcategories;
              const active = subcats[selectedIndustry];
              return (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {subcats.map((subcat, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedIndustry(i)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                          i === selectedIndustry
                            ? 'bg-[#612A4F] text-white border-[#612A4F] shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {subcat.name}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {active.hooks.map((hook, hIndex) => (
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
                </>
              );
            })()}

            {selectedCategory === "Emotion-Driven Hooks" && (() => {
              const subcats = HOOK_DATA["Emotion-Driven Hooks"].subcategories;
              const active = subcats[selectedEmotion];
              return (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {subcats.map((subcat, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedEmotion(i)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                          i === selectedEmotion
                            ? 'bg-[#612A4F] text-white border-[#612A4F] shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {subcat.name}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {active.hooks.map((hook, hIndex) => (
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
                </>
              );
            })()}

            {selectedCategory === "Create your own" && (
              <div>
                <div className="mb-6">
                  <h3 className="font-semibold text-base text-gray-700 mb-3">Your Custom Hooks</h3>

                  <div className="flex items-center gap-2 mb-6">
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
                    <p className="text-gray-500 text-sm">No custom hooks added yet. Create your first one above!</p>
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
