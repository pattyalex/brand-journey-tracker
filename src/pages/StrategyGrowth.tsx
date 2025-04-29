import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [activeTab, setActiveTab] = useState("brand-identity");
  const [missionStatement, setMissionStatement] = useState("");
  // Brand Identity states
  const [brandKeywords, setBrandKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [audienceAgeRanges, setAudienceAgeRanges] = useState<string[]>(["25-34"]);
  const [audienceLifestyle, setAudienceLifestyle] = useState("");
  const [audienceStruggles, setAudienceStruggles] = useState("");
  const [audienceDesires, setAudienceDesires] = useState("");
  const [selectedTones, setSelectedTones] = useState<string[]>(["relatable"]);
  const [colorPalette, setColorPalette] = useState<string[]>(["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]);


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


  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-8 fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold">Strategy & Growth</h1>
          <p className="text-muted-foreground">
            Define your brand identity, plan your content strategy, and track your growth
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    Remind yourself why you're building your brand. Return to this when you feel lost, distracted, or overwhelmed. It's your why.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Textarea
                    className="min-h-[150px] resize-none"
                    placeholder="Write your mission here — what you're here to do, what matters to you, and why you started this journey."
                    value={missionStatement}
                    onChange={(e) => setMissionStatement(e.target.value)}
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
                    Write down affirmations or thoughts that help you stay grounded and focused on your bigger picture.
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
                              alert("You can select up to 3 age ranges");
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
                              alert("You can select up to 3 tones");
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
            <p>Content strategy content will go here</p>
          </TabsContent>

          {/* Competitor Tracker Tab */}
          <TabsContent value="competitor-tracker" className="space-y-6">
            <p>Competitor tracker content will go here</p>
          </TabsContent>

          {/* Growth Goals Tab */}
          <TabsContent value="growth-goals" className="space-y-6">
            <p>Growth goals content will go here</p>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StrategyGrowth;