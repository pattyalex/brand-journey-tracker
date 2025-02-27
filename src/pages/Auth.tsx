
import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Lightbulb, Palette, AlignJustify, FileText, Target, MessageSquare, Text, ArrowRightCircle, Link, Upload, Check, ImageIcon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TabType = "brain-dump" | "content-ideas" | "inspiration";

interface InspirationSource {
  type: "link" | "image";
  content: string;
  label?: string;
}

const Auth = () => {
  const [activeTab, setActiveTab] = useState<TabType>("brain-dump");
  const [inspirationSource, setInspirationSource] = useState<InspirationSource>({
    type: "link",
    content: "https://pinterest.com/search/pins/?q=spring%20outfits",
    label: "Pinterest"
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setInspirationSource({
          type: "image",
          content: result,
          label: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLink = () => {
    if (linkUrl) {
      setInspirationSource({
        type: "link",
        content: linkUrl,
        label: linkLabel || new URL(linkUrl).hostname
      });
      setLinkUrl("");
      setLinkLabel("");
      setIsAddingLink(false);
    }
  };

  const renderInspirationCell = (source?: InspirationSource) => {
    if (!source) return null;

    if (source.type === "image" && source.content) {
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-3 w-3 text-blue-600" />
            <span className="text-blue-600 text-xs truncate max-w-[120px]">{source.label}</span>
          </div>
          <div className="w-16 h-16 relative">
            <img 
              src={source.content} 
              alt="Inspiration" 
              className="w-full h-full object-cover rounded-md border border-gray-200" 
            />
          </div>
        </div>
      );
    }

    return (
      <a href={source.content} 
         target="_blank" 
         rel="noopener noreferrer" 
         className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
        <Link className="h-3 w-3" />
        <span className="text-xs">{source.label || "Link"}</span>
      </a>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Content Ideation & Planning</h1>
          <p className="text-muted-foreground">
            Develop and organize your content ideas in one place
          </p>
        </div>

        <Tabs defaultValue="brain-dump" className="w-full" onValueChange={(value) => setActiveTab(value as TabType)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="brain-dump" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>Brain Dump</span>
            </TabsTrigger>
            <TabsTrigger value="content-ideas" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Content Ideas</span>
            </TabsTrigger>
            <TabsTrigger value="inspiration" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Inspiration</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brain-dump" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Brain Dump</h2>
                <p className="text-muted-foreground mb-6">
                  Quickly jot down all your thoughts and ideas without worrying about organization yet.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-md p-8 min-h-[300px]">
                  <p className="text-center text-muted-foreground">
                    Brain dump content will go here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content-ideas" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Content Ideas</h2>
                <p className="text-muted-foreground mb-6">
                  Organize your content ideas into categories and refine them for future content creation.
                </p>
                <div className="bg-white border border-gray-100 rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Lightbulb className="h-4 w-4" />
                              <span>Idea</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <AlignJustify className="h-4 w-4" />
                              <span>Pillar</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>Format</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              <span>Goal</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Link className="h-4 w-4" />
                              <span>Inspiration</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>Hook</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <ArrowRightCircle className="h-4 w-4" />
                              <span>Script</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Text className="h-4 w-4" />
                              <span>Caption</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">Spring outfits</td>
                          <td className="px-4 py-3 text-sm text-gray-700">Fashion</td>
                          <td className="px-4 py-3 text-sm text-gray-700">Text Only</td>
                          <td className="px-4 py-3 text-sm text-gray-700">Likes</td>
                          <td className="px-4 py-3 text-sm text-gray-700 min-w-[150px]">
                            <div className="flex flex-col space-y-2">
                              {renderInspirationCell(inspirationSource)}
                              
                              {isAddingLink ? (
                                <div className="flex flex-col space-y-2">
                                  <Input
                                    type="url"
                                    placeholder="https://example.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="text-xs h-7 px-2"
                                  />
                                  <Input
                                    type="text"
                                    placeholder="Label (optional)"
                                    value={linkLabel}
                                    onChange={(e) => setLinkLabel(e.target.value)}
                                    className="text-xs h-7 px-2"
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      size="xs"
                                      onClick={handleAddLink}
                                      className="text-xs"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      <span className="text-xs">Save</span>
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="xs"
                                      onClick={() => setIsAddingLink(false)}
                                      className="text-xs"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="xs"
                                    className="text-xs"
                                    onClick={() => setIsAddingLink(true)}
                                  >
                                    <Globe className="h-3 w-3 mr-1" />
                                    <span className="text-xs">Add Link</span>
                                  </Button>
                                  
                                  <label className="cursor-pointer">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleImageUpload}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="xs"
                                      className="text-xs"
                                    >
                                      <Upload className="h-3 w-3 mr-1" />
                                      <span className="text-xs">Upload</span>
                                    </Button>
                                  </label>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">3 outfit formulas for spring</td>
                          <td className="px-4 py-3 text-sm text-gray-700">Formula 1: Pastel blouse + wide leg jeans + ballet flats. Formula 2: Floral dress + denim jacket + white sneakers. Formula 3: Linen shirt + cropped pants + espadrilles.</td>
                          <td className="px-4 py-3 text-sm text-gray-700">If you don't know what to wear this spring, here are some outfit ideas ✨</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700 min-w-[150px]">
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                className="text-xs"
                                onClick={() => setIsAddingLink(true)}
                              >
                                <Globe className="h-3 w-3 mr-1" />
                                <span className="text-xs">Add Link</span>
                              </Button>
                              
                              <label className="cursor-pointer">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageUpload}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  className="text-xs"
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Upload</span>
                                </Button>
                              </label>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700 min-w-[150px]">
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                className="text-xs"
                                onClick={() => setIsAddingLink(true)}
                              >
                                <Globe className="h-3 w-3 mr-1" />
                                <span className="text-xs">Add Link</span>
                              </Button>
                              
                              <label className="cursor-pointer">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageUpload}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  className="text-xs"
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Upload</span>
                                </Button>
                              </label>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspiration" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Inspiration</h2>
                <p className="text-muted-foreground mb-6">
                  Save inspiration from around the web and organize visual references for your content.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-md p-8 min-h-[300px]">
                  <p className="text-center text-muted-foreground">
                    Inspiration board will go here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Auth;
