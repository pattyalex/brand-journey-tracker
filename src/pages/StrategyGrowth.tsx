import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PenTool,
  Users,
  MessageSquare,
  ImageIcon,
  Palette,
  Layers,
  Calendar,
  Video,
  BarChart,
  Target,
  Eye,
  FileText,
  TrendingUp,
  Award,
  PieChart,
  Plus,
  Trash2,
  Upload
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const StrategyGrowth = () => {
  // Brand Identity states
  const [brandKeywords, setBrandKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [audienceAgeRanges, setAudienceAgeRanges] = useState<string[]>(["25-34"]);
  const [audienceLifestyle, setAudienceLifestyle] = useState("");
  const [audienceStruggles, setAudienceStruggles] = useState("");
  const [audienceDesires, setAudienceDesires] = useState("");
  const [selectedTones, setSelectedTones] = useState<string[]>(["relatable"]);
  const [colorPalette, setColorPalette] = useState<string[]>(["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]);

  // Content Strategy states
  const [contentPillars, setContentPillars] = useState([
    { name: "Food", value: "Teaches followers healthy recipes" },
    { name: "Inspiration", value: "Motivates followers with success stories" },
    { name: "Entertainment", value: "Provides fun and engaging content" }
  ]);
  const [pillarInput, setPillarInput] = useState({ name: "", value: "" });
  const [monthlyThemes, setMonthlyThemes] = useState([
    { month: "January", theme: "New Beginnings" },
    { month: "February", theme: "Self-Love" }
  ]);
  const [newThemeMonth, setNewThemeMonth] = useState("");
  const [newThemeContent, setNewThemeContent] = useState("");

  const handleAddTheme = () => {
    if (newThemeMonth && newThemeContent) {
      // Check if the month already exists
      const monthExists = monthlyThemes.some(item => item.month === newThemeMonth);

      if (monthExists) {
        // If the month exists, update its theme
        setMonthlyThemes(monthlyThemes.map(item => 
          item.month === newThemeMonth 
            ? { ...item, theme: newThemeContent } 
            : item
        ));
      } else {
        // If the month doesn't exist, add a new entry
        setMonthlyThemes([...monthlyThemes, { month: newThemeMonth, theme: newThemeContent }]);
      }

      // Reset input fields
      setNewThemeMonth("");
      setNewThemeContent("");
    }
  };
  const [contentFormats, setContentFormats] = useState([
    { name: "Tutorial Reels", selected: true },
    { name: "Carousel Tips", selected: true },
    { name: "Behind-the-scenes", selected: false },
    { name: "Q&A Stories", selected: true }
  ]);

  // Competitor Tracker states
  const [competitors, setCompetitors] = useState([
    { 
      handle: "@competitor1", 
      niche: "Lifestyle", 
      platform: "Instagram",
      strengths: "Consistent aesthetic, high engagement on tutorials",
      notes: "Great use of carousel posts for tutorials" 
    }
  ]);
  const [newCompetitor, setNewCompetitor] = useState({ 
    handle: "", 
    niche: "", 
    platform: "Instagram",
    strengths: "",
    notes: "" 
  });

  // Growth Goals states
  const [goals, setGoals] = useState([
    { metric: "Followers", current: 5000, target: 10000, timeframe: "3 months" },
    { metric: "Engagement Rate", current: 3.5, target: 5, timeframe: "2 months" },
    { metric: "Brand Deals", current: 1, target: 3, timeframe: "6 months" },
    { metric: "Monthly Income", current: 800, target: 2500, timeframe: "6 months" }
  ]);

  // State for new goal
  const [newMetric, setNewMetric] = useState("");
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [targetValue, setTargetValue] = useState<number>(0);
  const [timeframe, setTimeframe] = useState("");

  // State for milestones
  const [milestones, setMilestones] = useState([
    { name: "First 1K followers", date: "Jan 15, 2023", completed: false, linkedGoal: "Followers", incrementValue: 1000 },
    { name: "First brand deal", date: "Mar 22, 2023", completed: false, linkedGoal: "Brand Deals", incrementValue: 1 },
    { name: "5K follower milestone", date: "June 10, 2023", completed: false, linkedGoal: "Followers", incrementValue: 5000 }
  ]);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");

  // New state to track active tab
  const [activeTab, setActiveTab] = useState("brand-identity");

  // Handlers
  const handleAddKeyword = () => {
    if (keywordInput.trim() !== "" && !brandKeywords.includes(keywordInput.trim())) {
      setBrandKeywords([...brandKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setBrandKeywords(brandKeywords.filter(k => k !== keyword));
  };

  const handleAddPillar = () => {
    if (pillarInput.name.trim() !== "" && pillarInput.value.trim() !== "") {
      setContentPillars([...contentPillars, { name: pillarInput.name, value: pillarInput.value }]);
      setPillarInput({ name: "", value: "" });
    }
  };

  const handleRemovePillar = (index: number) => {
    setContentPillars(contentPillars.filter((_, i) => i !== index));
  };

  const handleFormatToggle = (index: number) => {
    const updatedFormats = [...contentFormats];
    updatedFormats[index].selected = !updatedFormats[index].selected;
    setContentFormats(updatedFormats);
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.handle.trim() !== "") {
      setCompetitors([...competitors, newCompetitor]);
      setNewCompetitor({ 
        handle: "", 
        niche: "", 
        platform: "Instagram",
        strengths: "",
        notes: "" 
      });
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  // Helper function to calculate goal progress percentage
  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Handler for tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handler for adding a new goal
  const handleAddGoal = () => {
    if (newMetric && currentValue > 0 && targetValue > 0 && timeframe) {
      setGoals([...goals, {
        metric: newMetric,
        current: currentValue,
        target: targetValue,
        timeframe: timeframe
      }]);
      // Reset form after adding
      setNewMetric("");
      setCurrentValue(0);
      setTargetValue(0);
      setTimeframe("");
    }
  };

  // Handler for deleting a goal
  const handleDeleteGoal = (index: number) => {
    const updatedGoals = [...goals];
    updatedGoals.splice(index, 1);
    setGoals(updatedGoals);
  };

  // State for linking new milestone to goal
  const [selectedGoalLink, setSelectedGoalLink] = useState("");
  const [milestoneIncrementValue, setMilestoneIncrementValue] = useState<number>(0);

  // Handler for adding a milestone
  const handleAddMilestone = () => {
    if (newMilestoneName && newMilestoneDate) {
      // Format the date for display
      const dateObj = new Date(newMilestoneDate);
      const formattedDate = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });

      setMilestones([...milestones, { 
        name: newMilestoneName, 
        date: formattedDate,
        completed: false,
        linkedGoal: selectedGoalLink || undefined,
        incrementValue: milestoneIncrementValue || undefined
      }]);

      // Reset input fields
      setNewMilestoneName("");
      setNewMilestoneDate("");
      setSelectedGoalLink("");
      setMilestoneIncrementValue(0);
    }
  };

  // Handler for toggling milestone completion status
  const handleToggleMilestoneCompletion = (index: number) => {
    const updatedMilestones = [...milestones];
    const milestone = updatedMilestones[index];
    const newCompletionStatus = !milestone.completed;
    
    updatedMilestones[index] = {
      ...milestone,
      completed: newCompletionStatus
    };
    setMilestones(updatedMilestones);
    
    // Update corresponding long-term goal if this milestone is linked to one
    if (milestone.linkedGoal) {
      const goalIndex = goals.findIndex(goal => goal.metric === milestone.linkedGoal);
      if (goalIndex !== -1) {
        const updatedGoals = [...goals];
        // If completing the milestone, increment the current value
        if (newCompletionStatus) {
          // Increment by a fixed amount or percentage based on milestone weight
          const incrementAmount = milestone.incrementValue || 1;
          updatedGoals[goalIndex] = {
            ...updatedGoals[goalIndex],
            current: Math.min(updatedGoals[goalIndex].current + incrementAmount, updatedGoals[goalIndex].target)
          };
        } else {
          // If un-checking, decrement the current value
          const decrementAmount = milestone.incrementValue || 1;
          updatedGoals[goalIndex] = {
            ...updatedGoals[goalIndex],
            current: Math.max(updatedGoals[goalIndex].current - decrementAmount, 0)
          };
        }
        setGoals(updatedGoals);
        
        // Show success toast
        import("@/hooks/use-toast").then(({ toast }) => {
          toast({
            title: newCompletionStatus ? "Goal progress updated!" : "Goal progress reversed",
            description: `"${milestone.name}" has been marked as ${newCompletionStatus ? 'completed' : 'incomplete'}, and the "${milestone.linkedGoal}" goal was updated.`,
            variant: "default",
          });
        });
      }
    }
  };

  // Handler for deleting a milestone
  const handleDeleteMilestone = (index: number) => {
    const updatedMilestones = [...milestones];
    updatedMilestones.splice(index, 1);
    setMilestones(updatedMilestones);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-8 fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold">Strategy & Growth</h1>
          <p className="text-muted-foreground">
            Define your brand identity, plan your content strategy, and track your growth
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6 grid grid-cols-4 gap-4">
            <TabsTrigger value="brand-identity" className="flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              <span>Brand Identity</span>
            </TabsTrigger>
            <TabsTrigger value="content-strategy" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Content Strategy</span>
            </TabsTrigger>
            <TabsTrigger value="competitor-tracker" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Competitor Tracker</span>
            </TabsTrigger>
            <TabsTrigger value="growth-goals" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Growth Goals</span>
            </TabsTrigger>
          </TabsList>

          {/* Brand Identity Tab */}
          <TabsContent value="brand-identity" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mission Statement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Mission Statement
                  </CardTitle>
                  <CardDescription>
                    Remind yourself WHY you're building your brand. Return to this when you feel lost, distracted, or overwhelmed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="min-h-[150px] resize-none"
                    placeholder="Write your mission here — what you're here to do, what matters to you, and why you started this journey."
                  />
                </CardContent>
              </Card>

              {/* Affirmation & Reminders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Affirmation & Reminders
                  </CardTitle>
                  <CardDescription>
                    Write down affirmations, reminders or quotes that help you stay grounded and focused on your bigger picture.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="min-h-[150px] resize-none"
                    placeholder="Add daily affirmations that remind you of your purpose and values as a content creator."
                  />
                </CardContent>
              </Card>

              {/* Brand Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-primary" />
                    Brand Keywords
                  </CardTitle>
                  <CardDescription>
                    Define the core characteristics of your brand
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      value={keywordInput} 
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add a keyword (e.g., elegant, relatable)"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                    />
                    <Button onClick={handleAddKeyword}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {brandKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {keyword}
                        <button 
                          onClick={() => handleRemoveKeyword(keyword)} 
                          className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {brandKeywords.length === 0 && (
                      <p className="text-sm text-muted-foreground">No keywords added yet. Try adding words that describe your brand's personality.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Target Audience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Target Audience Persona
                  </CardTitle>
                  <CardDescription>
                    Define who your ideal audience is
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="age-range">Age Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["18-24", "25-34", "35-44", "45-54", "55+"].map((range) => (
                        <div
                          key={range}
                          onClick={() => {
                            if (audienceAgeRanges.includes(range)) {
                              setAudienceAgeRanges(audienceAgeRanges.filter(r => r !== range));
                            } else if (audienceAgeRanges.length < 3) {
                              setAudienceAgeRanges([...audienceAgeRanges, range]);
                            } else {
                              // Show toast notification when maximum selections reached
                              import("@/hooks/use-toast").then(({ showMaxAgeRangesSelectedToast }) => {
                                showMaxAgeRangesSelectedToast();
                              });
                            }
                          }}
                          className={`p-2 border rounded-md cursor-pointer transition-all ${
                            audienceAgeRanges.includes(range) ? "border-primary bg-primary/10" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{range}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Toast notification will be shown instead of static text */}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lifestyle">Lifestyle</Label>
                    <Input
                      id="lifestyle"
                      value={audienceLifestyle}
                      onChange={(e) => setAudienceLifestyle(e.target.value)}
                      placeholder="e.g., busy professionals, college students"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="struggles">Struggles</Label>
                    <Textarea
                      id="struggles"
                      value={audienceStruggles}
                      onChange={(e) => setAudienceStruggles(e.target.value)}
                      placeholder="What challenges do they face?"
                      className="resize-none h-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desires">Desires</Label>
                    <Textarea
                      id="desires"
                      value={audienceDesires}
                      onChange={(e) => setAudienceDesires(e.target.value)}
                      placeholder="What do they aspire to achieve?"
                      className="resize-none h-20"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tone of Voice */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Tone of Voice
                  </CardTitle>
                  <CardDescription>
                    Define how your brand communicates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-2">Select up to 3 tones that represent your brand voice</p>
                    <div className="grid grid-cols-2 gap-3">
                      {["playful", "luxury", "educational", "relatable", "motivational", "bossy big sis", "authoritative", "casual"].map((tone) => (
                        <div
                          key={tone}
                          onClick={() => {
                            if (selectedTones.includes(tone)) {
                              setSelectedTones(selectedTones.filter(t => t !== tone));
                            } else if (selectedTones.length < 3) {
                              setSelectedTones([...selectedTones, tone]);
                            } else {
                              // Show toast notification when maximum selections reached
                              import("@/hooks/use-toast").then(({ showMaxAgeRangesSelectedToast }) => {
                                showMaxAgeRangesSelectedToast();
                              });
                            }
                          }}
                          className={`p-3 border rounded-md cursor-pointer transition-all ${
                            selectedTones.includes(tone) ? "border-primary bg-primary/10" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <p className="font-medium capitalize">{tone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Toast notification will be shown instead of static text */}
                  </div>
                </CardContent>
              </Card>

              {/* Moodboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Moodboard
                  </CardTitle>
                  <CardDescription>
                    Upload images or embed a Pinterest board
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium">Upload images</h3>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    <div className="mt-4">
                      <Button variant="outline" className="flex items-center gap-2 relative">
                        <Upload className="h-4 w-4" />
                        <span>Upload files</span>
                        <input type="file" className="absolute inset-0 w-full opacity-0 cursor-pointer" multiple />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pinterest">Pinterest Board URL</Label>
                    <Input id="pinterest" placeholder="https://pinterest.com/username/board-name" />
                    <p className="text-xs text-muted-foreground">Paste your Pinterest board URL to embed it</p>
                  </div>
                </CardContent>
              </Card>

              {/* Color Palette */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Color Palette & Aesthetics
                  </CardTitle>
                  <CardDescription>
                    Define your brand's visual identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label>Primary Colors</Label>
                      <div className="flex gap-2">
                        {colorPalette.map((color, index) => (
                          <Popover key={index}>
                            <PopoverTrigger asChild>
                              <div
                                className="w-10 h-10 rounded-md cursor-pointer border"
                                style={{ backgroundColor: color }}
                              />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                              <div className="space-y-2">
                                <input
                                  type="color"
                                  value={color}
                                  onChange={(e) => {
                                    const newPalette = [...colorPalette];
                                    newPalette[index] = e.target.value;
                                    setColorPalette(newPalette);
                                  }}
                                  className="w-32 h-10"
                                />
                                <Input
                                  value={color}
                                  onChange={(e) => {
                                    const newPalette = [...colorPalette];
                                    newPalette[index] = e.target.value;
                                    setColorPalette(newPalette);
                                  }}
                                  className="w-32"
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                        ))}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setColorPalette([...colorPalette, "#FFFFFF"])}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="typography">Typography</Label>
                      <Input id="typography" placeholder="e.g., Montserrat, Playfair Display" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aesthetic">Aesthetic Direction</Label>
                      <Input id="aesthetic" placeholder="e.g., Minimalist, Boho, Luxury" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Strategy Tab */}
          <TabsContent value="content-strategy" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Value Map */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Value Map
                  </CardTitle>
                  <CardDescription>
                    Define what value each content pillar delivers to your audience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4">
                      {contentPillars.map((pillar, index) => (
                        <div key={index} className="flex flex-col gap-2 p-4 border rounded-md">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{pillar.name}</h4>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRemovePillar(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-muted-foreground text-sm">{pillar.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-4">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <Input
                          placeholder="Pillar name"
                          value={pillarInput.name}
                          onChange={(e) => setPillarInput({ ...pillarInput, name: e.target.value })}
                        />
                        <Input
                          placeholder="Value it provides"
                          value={pillarInput.value}
                          onChange={(e) => setPillarInput({ ...pillarInput, value: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddPillar}>Add Pillar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Themes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Monthly Themes
                  </CardTitle>
                  <CardDescription>
                    Plan content themes for upcoming months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium">Month</th>
                            <th className="px-4 py-2 text-left font-medium">Theme</th>
                            <th className="px-4 py-2 text-left font-medium w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyThemes.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-3">{item.month}</td>
                              <td className="px-4 py-3">{item.theme}</td>
                              <td className="px-4 py-3">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setMonthlyThemes(monthlyThemes.filter((_, i) => i !== index));
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        className="p-2 border rounded-md bg-white" 
                        value={newThemeMonth} 
                        onChange={(e) => setNewThemeMonth(e.target.value)}
                      >
                        <option value="">Select Month</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                      <Input 
                        placeholder="Theme (e.g., Self-Love)" 
                        value={newThemeContent}
                        onChange={(e) => setNewThemeContent(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={handleAddTheme}
                      disabled={!newThemeMonth || !newThemeContent}
                    >
                      Add Theme
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Content Formats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    Content Formats
                  </CardTitle>
                  <CardDescription>
                    Select the formats you want to create
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentFormats.map((format, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <span>{format.name}</span>
                        <Switch 
                          checked={format.selected}
                          onCheckedChange={() => handleFormatToggle(index)}
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Input placeholder="New format (e.g., Day-in-life Vlogs)" className="flex-1" />
                      <Button>Add</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>


            </div>
          </TabsContent>

          {/* Competitor Tracker Tab */}
          <TabsContent value="competitor-tracker" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Competitor & Inspiration Tracker
                </CardTitle>
                <CardDescription>
                  Keep tabs on creators who inspire you or compete in your niche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input 
                      placeholder="@handle" 
                      value={newCompetitor.handle}
                      onChange={(e) => setNewCompetitor({...newCompetitor, handle: e.target.value})}
                    />
                    <Input 
                      placeholder="Niche (e.g., Beauty, Fitness)" 
                      value={newCompetitor.niche}
                      onChange={(e) => setNewCompetitor({...newCompetitor, niche: e.target.value})}
                    />
                    <select 
                      className="p-2 border rounded-md"
                      value={newCompetitor.platform}
                      onChange={(e) => setNewCompetitor({...newCompetitor, platform: e.target.value})}
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Pinterest">Pinterest</option>
                      <option value="LinkedIn">LinkedIn</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      placeholder="What do they do well?" 
                      value={newCompetitor.strengths}
                      onChange={(e) => setNewCompetitor({...newCompetitor, strengths: e.target.value})}
                    />
                    <Input 
                      placeholder="Notes (trends, strategies to try)" 
                      value={newCompetitor.notes}
                      onChange={(e) => setNewCompetitor({...newCompetitor, notes: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleAddCompetitor} className="w-full">Add Creator</Button>
                </div>

                <div className="mt-6 border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Handle</th>
                        <th className="px-4 py-2 text-left font-medium">Niche</th>
                        <th className="px-4 py-2 text-left font-medium">Platform</th>
                        <th className="px-4 py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitors.map((competitor, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3 font-medium">{competitor.handle}</td>
                          <td className="px-4 py-3">{competitor.niche}</td>
                          <td className="px-4 py-3">{competitor.platform}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">View</Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemoveCompetitor(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-muted/40">
                    <CardHeader className="py-4"><CardTitle className="text-base">Differentiation Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label>What makes you different?</Label>
                        <Textarea 
                          placeholder="How is your content/approach unique compared to competitors?"
                          className="h-24 resize-none"
                        />
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label>Unique selling points</Label>
                        <Input placeholder="e.g., Insider industry knowledge" className="mb-2" />
                        <Input placeholder="e.g., Authentic behind-the-scenes" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/40">
                    <CardHeader className="py-4">
                      <CardTitle className="text-base">Performance Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Auto-track competitor growth</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Get alerts about top content</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Compare engagement rates</span>
                          <Switch />
                        </div>
                        <Button variant="outline" className="w-full">Import Analytics</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Growth Goals Tab */}
          <TabsContent value="growth-goals" className="space-y-6">
            <h2 className="text-2xl font-bold mb-2">SMART Goals</h2>
            <p className="text-muted-foreground mb-4">Set specific, measurable, achievable, relevant, and time-bound goals</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Growth Goals Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Long-Term Goals
                  </CardTitle>
                  <CardDescription>
                    Set the goals you want to accomplish within the next few months to a year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {goals.map((goal, index) => (
                      <div key={index} className="space-y-2 group">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{goal.metric}</h4>
                            <p className="text-sm text-muted-foreground">
                              Goal: {goal.target} in {goal.timeframe}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">{goal.current}</p>
                              <p className="text-sm text-muted-foreground">Current</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteGoal(index)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Progress value={calculateProgress(goal.current, goal.target)} className="h-2" />
                          <p className="text-xs text-right text-muted-foreground">
                            {calculateProgress(goal.current, goal.target)}% of goal
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* State for new goal inputs */}
                      <div className="space-y-2">
                        <Label>Add New Goal</Label>
                        <Input
                          placeholder="e.g., Followers, income, subscribers"
                          value={newMetric}
                          onChange={(e) => setNewMetric(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Current Status</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 1000 followers" 
                          value={currentValue || ""}
                          onChange={(e) => setCurrentValue(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Target Value</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 5000 followers" 
                          value={targetValue || ""}
                          onChange={(e) => setTargetValue(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Timeframe</Label>
                        <Input 
                          placeholder="e.g., 3 months" 
                          value={timeframe}
                          onChange={(e) => setTimeframe(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                        <Button 
                          className="w-full"
                          onClick={handleAddGoal}
                          disabled={!newMetric || !currentValue || !targetValue || !timeframe}
                        >
                          Add Goal
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="pb-8"></div>
              </Card>


              {/* Milestone Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Short-Term Goals
                  </CardTitle>
                  <CardDescription>
                    List the things you want to accomplish soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium w-10">Done</th>
                            <th className="px-4 py-2 text-left font-medium">Goal</th>
                            <th className="px-4 py-2 text-left font-medium">Date</th>
                            <th className="px-4 py-2 text-left font-medium">Linked Goal</th>
                            <th className="px-4 py-2 text-left font-medium w-16"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {milestones.map((milestone, index) => (
                            <tr key={index} className={`border-t group ${milestone.completed ? "bg-muted/20" : ""}`}>
                              <td className="px-4 py-3">
                                <Checkbox 
                                  checked={milestone.completed}
                                  onCheckedChange={() => handleToggleMilestoneCompletion(index)}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <span className={milestone.completed ? "line-through text-muted-foreground" : ""}>
                                  {milestone.name}
                                </span>
                              </td>
                              <td className="px-4 py-3">{milestone.date}</td>
                              <td className="px-4 py-3">
                                {milestone.linkedGoal ? (
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      {milestone.linkedGoal}
                                    </Badge>
                                    {milestone.incrementValue && (
                                      <span className="text-xs text-muted-foreground">
                                        +{milestone.incrementValue}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Not linked</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteMilestone(index)}
                                  className="h-8 w-8 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input 
                        placeholder="Goal name" 
                        value={newMilestoneName}
                        onChange={(e) => setNewMilestoneName(e.target.value)}
                      />
                      <Input 
                        type="date" 
                        value={newMilestoneDate}
                        onChange={(e) => setNewMilestoneDate(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Link to Long-Term Goal</Label>
                        <select
                          className="w-full p-2 border rounded-md bg-background text-xs"
                          value={selectedGoalLink}
                          onChange={(e) => setSelectedGoalLink(e.target.value)}
                        >
                          <option value="" className="text-xs">Not linked</option>
                          {goals.map((goal, idx) => (
                            <option key={idx} value={goal.metric}>{goal.metric}</option>
                          ))}
                        </select>
                      </div>
                      {selectedGoalLink && (
                        <div className="space-y-1">
                          <Label className="text-xs">Progress Value</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 1000"
                            value={milestoneIncrementValue || ""}
                            onChange={(e) => setMilestoneIncrementValue(Number(e.target.value))}
                          />
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={handleAddMilestone}
                      disabled={!newMilestoneName || !newMilestoneDate}
                    >
                      Add Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StrategyGrowth;