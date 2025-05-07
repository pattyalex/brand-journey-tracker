
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  CheckSquare, 
  Edit, 
  BarChart2, 
  Layers, 
  Settings, 
  Handshake,
  Award,
  Coffee,
  Sun,
  Moon
} from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [greetingIcon, setGreetingIcon] = useState<React.ReactNode>(null);
  const [journalEntries, setJournalEntries] = useState({
    whatWouldMakeTodayGreat: "",
    todaysAffirmations: "",
    threeThingsImGratefulFor: ""
  });
  const [goals, setGoals] = useState([]);
  const [moodboardImages, setMoodboardImages] = useState<string[]>([]);

  // Set greeting based on time of day
  useEffect(() => {
    const getCurrentGreeting = () => {
      const hour = new Date().getHours();
      const userName = "Maria"; // This would be fetched from user data in a real app

      if (hour >= 5 && hour < 12) {
        setGreeting(`Good morning, ${userName}!`);
        setGreetingIcon(<Coffee className="h-10 w-10 text-amber-500" />);
      } else if (hour >= 12 && hour < 18) {
        setGreeting(`Good afternoon, ${userName}!`);
        setGreetingIcon(<Sun className="h-10 w-10 text-yellow-500" />);
      } else {
        setGreeting(`Good evening, ${userName}!`);
        setGreetingIcon(<Moon className="h-10 w-10 text-indigo-400" />);
      }
    };

    getCurrentGreeting();
  }, []);

  // Load journal entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Load goals from localStorage (these would be fetched from the Goals page in a real app)
  useEffect(() => {
    // For demo, fetch goals from StrategyGrowth page
    const loadGoals = () => {
      const goalsStr = localStorage.getItem('growthGoals');
      if (goalsStr) {
        setGoals(JSON.parse(goalsStr));
      } else {
        // Default demo data if none exists
        setGoals([
          { metric: "Followers", current: 5000, target: 10000, timeframe: "3 months" },
          { metric: "Engagement Rate", current: 3.5, target: 5, timeframe: "2 months" },
          { metric: "Brand Deals", current: 1, target: 3, timeframe: "6 months" }
        ]);
      }
    };
    
    loadGoals();
  }, []);

  // In a real app, these would be loaded from a database or storage
  useEffect(() => {
    // Demo mood board images
    setMoodboardImages([
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206"
    ]);
  }, []);

  // Handle journal entry changes
  const handleJournalChange = (field: string, value: string) => {
    const updatedEntries = {
      ...journalEntries,
      [field]: value
    };
    setJournalEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
  };

  // Navigation shortcuts
  const shortcuts = [
    { 
      title: "Plan your week", 
      icon: Calendar, 
      path: "/task-board?view=weekly-content-tasks",
      description: "Schedule your week ahead"
    },
    { 
      title: "Plan your day", 
      icon: CheckSquare, 
      path: "/task-board",
      description: "Organize today's tasks"
    },
    { 
      title: "Create a post", 
      icon: Edit, 
      path: "/bank-of-content",
      description: "Draft your next content piece"
    },
    { 
      title: "Check content calendar", 
      icon: Layers, 
      path: "/content-calendar",
      description: "View your content schedule"
    },
    { 
      title: "Check how your posts are doing", 
      icon: BarChart2, 
      path: "/analytics",
      description: "Monitor your performance"
    },
    { 
      title: "Build your personal brand", 
      icon: Award, 
      path: "/strategy-growth",
      description: "Develop your brand strategy"
    },
    { 
      title: "Manage your partnerships", 
      icon: Handshake, 
      path: "/partnerships-management",
      description: "Track your collaborations"
    },
    { 
      title: "Admin Hub", 
      icon: Settings, 
      path: "/settings",
      description: "Manage your account"
    }
  ];

  return (
    <Layout>
      <ScrollArea className="h-screen">
        <div className="container max-w-4xl mx-auto py-8 px-6 space-y-12">
          {/* Greeting Section */}
          <section className="fade-in flex items-center space-x-4">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">{greeting}</h1>
              <p className="text-muted-foreground">It's time to plan your day and create amazing content.</p>
            </div>
            <div>
              {greetingIcon}
            </div>
          </section>

          {/* Journaling Section */}
          <section className="space-y-4 fade-in">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-medium">Your Journal</CardTitle>
                <CardDescription>Reflect on your day and set your intentions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">What would make today great?</h3>
                  <Textarea 
                    placeholder="List 1-3 things that would make today wonderful..."
                    value={journalEntries.whatWouldMakeTodayGreat}
                    onChange={(e) => handleJournalChange('whatWouldMakeTodayGreat', e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Today's affirmations:</h3>
                  <Textarea 
                    placeholder="Write your daily affirmations..."
                    value={journalEntries.todaysAffirmations}
                    onChange={(e) => handleJournalChange('todaysAffirmations', e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Three things I'm grateful for:</h3>
                  <Textarea 
                    placeholder="What are you grateful for today?"
                    value={journalEntries.threeThingsImGratefulFor}
                    onChange={(e) => handleJournalChange('threeThingsImGratefulFor', e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Navigation Shortcuts Grid */}
          <section className="fade-in">
            <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {shortcuts.map((shortcut, index) => (
                <Card 
                  key={index}
                  className="border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(shortcut.path)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <shortcut.icon className="h-10 w-10 text-primary mb-3" />
                    <h3 className="font-medium text-sm mb-1">{shortcut.title}</h3>
                    <p className="text-xs text-muted-foreground">{shortcut.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Goals Section */}
          <section className="fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Goals</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/strategy-growth')}
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {goals.map((goal: any, index: number) => (
                <Card key={index} className="border border-gray-100 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{goal.metric}</h3>
                      <span className="text-sm text-muted-foreground">Target: {goal.timeframe}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {goal.current} / {goal.target}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Mood Board Section */}
          <section className="fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Mood Board</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/vision-board')}
              >
                Edit Board
              </Button>
            </div>
            
            <Card className="border border-gray-100 shadow-sm p-2">
              <CardContent className="p-4 grid grid-cols-3 gap-2">
                {moodboardImages.map((image, index) => (
                  <div 
                    key={index} 
                    className="aspect-square rounded-md overflow-hidden"
                    style={{ 
                      backgroundImage: `url(${image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  ></div>
                ))}
                {/* Placeholder for more images */}
                <div className="aspect-square rounded-md bg-gray-100 flex items-center justify-center">
                  <Button variant="ghost" size="sm" className="text-xs">
                    + Add More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* AI Recommendations Section */}
          <section className="fade-in">
            <Card className="border border-primary/20 shadow-sm bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl font-medium">AI Recommendations</CardTitle>
                <CardDescription>Personalized tips and insights for your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-md shadow-sm">
                    <h4 className="font-medium mb-1">Content Idea</h4>
                    <p className="text-sm text-muted-foreground">Based on your recent analytics, your audience responds well to tutorial-style content. Consider creating more how-to videos this week.</p>
                  </div>
                  <div className="p-4 bg-white rounded-md shadow-sm">
                    <h4 className="font-medium mb-1">Optimal Posting Time</h4>
                    <p className="text-sm text-muted-foreground">Your engagement is highest between 6-8pm on weekdays. Try scheduling your next post during this window.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Get More Recommendations
                </Button>
              </CardFooter>
            </Card>
          </section>
        </div>
      </ScrollArea>
    </Layout>
  );
};

export default HomePage;
