
import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Lightbulb, Palette, AlignJustify, FileText, Target, MessageSquare, Text, ArrowRightCircle } from "lucide-react";

type TabType = "brain-dump" | "content-ideas" | "inspiration";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<TabType>("brain-dump");

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
                              <MessageSquare className="h-4 w-4" />
                              <span>Hook</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Text className="h-4 w-4" />
                              <span>Caption</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <ArrowRightCircle className="h-4 w-4" />
                              <span>CTA</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">Introduction to...</td>
                          <td className="px-4 py-3 text-sm text-gray-700">Fashion</td>
                          <td className="px-4 py-3 text-sm text-gray-700">Text Only</td>
                          <td className="px-4 py-3 text-sm text-gray-700">Likes</td>
                          <td className="px-4 py-3 text-sm text-gray-700">Comment [word] below to get...</td>
                          <td className="px-4 py-3 text-sm text-gray-700">⚠️ WARNING - You will be...</td>
                          <td className="px-4 py-3 text-sm text-gray-700">Check it out!</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
                          <td className="px-4 py-3 text-sm text-gray-700"></td>
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
