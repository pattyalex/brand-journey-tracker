
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  const [audienceAge, setAudienceAge] = useState("25-34");
  const [audienceLifestyle, setAudienceLifestyle] = useState("");
  const [audienceStruggles, setAudienceStruggles] = useState("");
  const [audienceDesires, setAudienceDesires] = useState("");
  const [selectedTones, setSelectedTones] = useState<string[]>(["relatable"]);
  const [colorPalette, setColorPalette] = useState<string[]>(["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]);
  
  // Content Strategy states
  const [contentPillars, setContentPillars] = useState([
    { name: "Education", value: "Educates followers on industry topics" },
    { name: "Inspiration", value: "Motivates followers with success stories" },
    { name: "Entertainment", value: "Provides fun and engaging content" }
  ]);
  const [pillarInput, setPillarInput] = useState({ name: "", value: "" });
  const [monthlyThemes, setMonthlyThemes] = useState([
    { month: "January", theme: "New Beginnings" },
    { month: "February", theme: "Self-Love" }
  ]);
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
                    <select
                      id="age-range"
                      value={audienceAge}
                      onChange={(e) => setAudienceAge(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background text-foreground"
                    >
                      <option value="18-24">18-24</option>
                      <option value="25-34">25-34</option>
                      <option value="35-44">35-44</option>
                      <option value="45-54">45-54</option>
                      <option value="55+">55+</option>
                    </select>
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
                            }
                          }}
                          className={`p-3 border rounded-md cursor-pointer transition-all ${
                            selectedTones.includes(tone) ? "border-primary bg-primary/10" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <p className="font-medium capitalize">{tone}</p>
                            {selectedTones.includes(tone) && (
                              <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                                {selectedTones.indexOf(tone) + 1}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedTones.length === 3 && (
                      <p className="text-xs text-amber-600 mt-2">Maximum of 3 tones selected</p>
                    )}
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
                    Weekly/Monthly Themes
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
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyThemes.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-3">{item.month}</td>
                              <td className="px-4 py-3">{item.theme}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select className="p-2 border rounded-md">
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
                      <Input placeholder="Theme (e.g., Self-Love February)" />
                    </div>
                    <Button className="w-full">Add Theme</Button>
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

              {/* AI Prompt Helper */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Content Idea Generator
                  </CardTitle>
                  <CardDescription>
                    Get AI suggestions based on your content pillars
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea 
                      placeholder="Based on my pillars, suggest 5 post ideas for each this month."
                      className="h-32 resize-none"
                    />
                    <Button className="w-full">Generate Ideas</Button>
                    <div className="p-4 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground italic">
                        AI-generated ideas will appear here. Press the button above to get started.
                      </p>
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
                    <CardHeader className="py-4">
                      <CardTitle className="text-base">Differentiation Analysis</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Growth Goals Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    SMART Goals
                  </CardTitle>
                  <CardDescription>
                    Set specific, measurable, achievable, relevant, and time-bound goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {goals.map((goal, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{goal.metric}</h4>
                            <p className="text-sm text-muted-foreground">
                              Goal: {goal.target} in {goal.timeframe}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{goal.current}</p>
                            <p className="text-sm text-muted-foreground">Current</p>
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
                    <h3 className="font-medium mb-4">Add New Goal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Metric</Label>
                        <select className="w-full p-2 border rounded-md">
                          <option value="">Select Metric</option>
                          <option value="Followers">Followers</option>
                          <option value="Engagement Rate">Engagement Rate</option>
                          <option value="Brand Deals">Brand Deals</option>
                          <option value="Monthly Income">Monthly Income</option>
                          <option value="Video Views">Video Views</option>
                          <option value="Email Subscribers">Email Subscribers</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Current Value</Label>
                        <Input type="number" placeholder="e.g., 1000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Target Value</Label>
                        <Input type="number" placeholder="e.g., 5000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Timeframe</Label>
                        <Input placeholder="e.g., 3 months" />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                        <Button className="w-full">Add Goal</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Vision Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Vision Card
                  </CardTitle>
                  <CardDescription>
                    Remind yourself why you're building your brand
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Purpose Statement</Label>
                      <Textarea 
                        placeholder="Why did you start creating content? What impact do you want to have?"
                        className="h-32 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Inspiration Images</Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                        <ImageIcon className="mx-auto h-10 w-10 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium">Upload inspiration</h3>
                        <p className="mt-1 text-xs text-gray-500">Vision board, dream life images</p>
                        <div className="mt-4">
                          <Button variant="outline" size="sm" className="relative">
                            Upload
                            <input type="file" className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Favorite Quote</Label>
                      <Input placeholder="A quote that motivates you" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Milestone Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Milestone Tracker
                  </CardTitle>
                  <CardDescription>
                    Celebrate your wins along the way
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium">Milestone</th>
                            <th className="px-4 py-2 text-left font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="px-4 py-3">First 1K followers</td>
                            <td className="px-4 py-3">Jan 15, 2023</td>
                          </tr>
                          <tr className="border-t">
                            <td className="px-4 py-3">First brand deal</td>
                            <td className="px-4 py-3">Mar 22, 2023</td>
                          </tr>
                          <tr className="border-t">
                            <td className="px-4 py-3">5K follower milestone</td>
                            <td className="px-4 py-3">June 10, 2023</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Milestone name" />
                      <Input type="date" />
                    </div>
                    <Button className="w-full">Add Milestone</Button>
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
