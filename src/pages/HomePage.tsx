
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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  Moon,
  PlusCircle,
  Trash2
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
  const [priorities, setPriorities] = useState<{id: number, text: string}[]>([
    { id: 1, text: "Finish editing weekend vlog" },
    { id: 2, text: "Respond to brand email" },
    { id: 3, text: "Draft caption for tomorrow's post" }
  ]);
  const [isAddPriorityOpen, setIsAddPriorityOpen] = useState(false);
  const [newPriorityText, setNewPriorityText] = useState("");

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

  // Load journal entries and priorities from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }
    
    // Initialize the homeTasks localStorage if it doesn't exist
    if (!localStorage.getItem('homeTasks')) {
      localStorage.setItem('homeTasks', JSON.stringify([]));
    }
    
    // Load saved priorities if they exist
    const savedPriorities = localStorage.getItem('homePriorities');
    if (savedPriorities) {
      setPriorities(JSON.parse(savedPriorities));
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

  // Handle adding new priority task
  const handleAddPriority = () => {
    if (newPriorityText.trim()) {
      const newPriority = {
        id: Math.max(0, ...priorities.map(p => p.id)) + 1,
        text: newPriorityText.trim()
      };
      
      const updatedPriorities = [...priorities, newPriority];
      setPriorities(updatedPriorities);
      
      // Reset state and close dialog
      setNewPriorityText("");
      setIsAddPriorityOpen(false);
      
      // Store in localStorage for persistence
      const homeTasks = JSON.parse(localStorage.getItem('homeTasks') || '[]');
      localStorage.setItem('homePriorities', JSON.stringify(updatedPriorities));
    }
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
        <div className="container px-4 md:px-6 py-6 md:py-10">
          {/* Greeting Section - Top Banner */}
          <section className="mb-8 fade-in">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{greeting}</h1>
                <p className="text-muted-foreground">Welcome to your content hub. What would you like to create today?</p>
              </div>
              <div className="bg-white p-3 rounded-full shadow-sm">
                {greetingIcon}
              </div>
            </div>
          </section>

          {/* Main Content Area - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              {/* Journaling Section */}
              <section className="space-y-4 fade-in">
                <h2 className="text-xl font-bold mb-4">Your Journal</h2>
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="space-y-6">
                    <div className="pt-4">
                      <h3 className="font-medium mb-2 text-sm">What would make today great?</h3>
                      <Textarea 
                        placeholder="List 1-3 things that would make today wonderful..."
                        value={journalEntries.whatWouldMakeTodayGreat}
                        onChange={(e) => handleJournalChange('whatWouldMakeTodayGreat', e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="font-medium mb-2 text-sm">Today's affirmations:</h3>
                      <Textarea 
                        placeholder="Write your daily affirmations..."
                        value={journalEntries.todaysAffirmations}
                        onChange={(e) => handleJournalChange('todaysAffirmations', e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="font-medium mb-2 text-sm">Three things I'm grateful for:</h3>
                      <Textarea 
                        placeholder="List three things you're grateful for today..."
                        value={journalEntries.threeThingsImGratefulFor}
                        onChange={(e) => handleJournalChange('threeThingsImGratefulFor', e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>
              
              {/* Quick Access Section - Grid of Cards */}
              <section className="fade-in">
                <h2 className="text-xl font-bold mb-4">Quick Access</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {shortcuts.slice(0, 8).map((shortcut, index) => (
                    <Card 
                      key={index}
                      className="border border-gray-100 shadow-sm hover:shadow transition-all cursor-pointer"
                      onClick={() => navigate(shortcut.path)}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                        <shortcut.icon className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-medium text-sm">{shortcut.title}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Recent Content Section */}
              <section className="fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Recent Content</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/bank-of-content')}
                    className="text-xs"
                  >
                    View All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-gray-100 shadow-sm">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                        <Edit className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">Morning Routine Video</h3>
                      <p className="text-xs text-muted-foreground">Draft • 2 days ago</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-100 shadow-sm">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                        <Edit className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">Healthy Breakfast Ideas</h3>
                      <p className="text-xs text-muted-foreground">Scheduled • Tomorrow</p>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-8">
              {/* Today's Top Priority Tasks Section */}
              <section className="fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Today's Top Priorities</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsAddPriorityOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                    {priorities.map((task) => (
                      <div key={task.id} className="flex items-start group justify-between">
                        <div className="flex items-start">
                          <Checkbox 
                            id={`task-${task.id}`}
                            className="h-5 w-5 rounded mr-3 mt-0.5 flex-shrink-0 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white border-gray-300"
                            onCheckedChange={(checked) => {
                              const tasks = JSON.parse(localStorage.getItem('homeTasks') || '[]');
                              if (checked) {
                                if (!tasks.includes(task.id)) {
                                  tasks.push(task.id);
                                }
                              } else {
                                const index = tasks.indexOf(task.id);
                                if (index > -1) {
                                  tasks.splice(index, 1);
                                }
                              }
                              localStorage.setItem('homeTasks', JSON.stringify(tasks));
                            }}
                            defaultChecked={JSON.parse(localStorage.getItem('homeTasks') || '[]').includes(task.id)}
                          />
                          <label 
                            htmlFor={`task-${task.id}`} 
                            className="text-sm cursor-pointer peer-data-[state=checked]:line-through peer-data-[state=checked]:text-gray-500"
                          >
                            {task.text}
                          </label>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            // Remove task from localStorage
                            const tasks = JSON.parse(localStorage.getItem('homeTasks') || '[]');
                            const index = tasks.indexOf(task.id);
                            if (index > -1) {
                              tasks.splice(index, 1);
                            }
                            localStorage.setItem('homeTasks', JSON.stringify(tasks));
                            
                            // For a real app, this would trigger a state update to remove the task from the UI
                            // For demo purposes, we'll reload the page to show the changes
                            window.location.reload();
                          }}
                        >
                          <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  </CardContent>
                </Card>
              </section>

              {/* Goals Section */}
              <section className="fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Your Goals</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/strategy-growth')}
                  >
                    View All
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {goals.map((goal: any, index: number) => (
                    <Card key={index} className="border border-gray-100 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-medium text-sm">{goal.metric}</h3>
                          <span className="text-xs text-muted-foreground">Target: {goal.timeframe}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium whitespace-nowrap">
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Mood Board</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/vision-board')}
                  >
                    Edit
                  </Button>
                </div>
                
                <Card className="border border-gray-100 shadow-sm overflow-hidden">
                  <CardContent className="p-2">
                    <div className="grid grid-cols-3 gap-2">
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
                      <div className="aspect-square rounded-md bg-gray-100 flex items-center justify-center">
                        <PlusCircle className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>

          {/* AI Recommendations Section - Bottom Full Width */}
          <section className="mt-8 fade-in">
            <Card className="border border-primary/20 shadow-sm bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-medium">AI Recommendations</CardTitle>
                <CardDescription>Personalized tips based on your content performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

{/* Add Priority Dialog */}
      <Dialog open={isAddPriorityOpen} onOpenChange={setIsAddPriorityOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Priority</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="priority-text">Priority Task</Label>
              <Input
                id="priority-text"
                value={newPriorityText}
                onChange={(e) => setNewPriorityText(e.target.value)}
                placeholder="Enter your priority task"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPriorityOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPriority} disabled={!newPriorityText.trim()}>
              Add Priority
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default HomePage;
