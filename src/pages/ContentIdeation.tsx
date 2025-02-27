
import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Lightbulb, Palette } from "lucide-react";

type TabType = "brain-dump" | "content-ideas" | "inspiration";

const ContentIdeation = () => {
  const [activeTab, setActiveTab] = useState<TabType>("brain-dump");

  return (
    <Layout>
      <div className="space-y-8 fade-in max-w-5xl mx-auto">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold">Content Ideation & Planning</h1>
          <p className="text-muted-foreground text-lg">
            Develop and organize your content ideas in one place
          </p>
        </div>

        <Tabs defaultValue="brain-dump" className="w-full" onValueChange={(value) => setActiveTab(value as TabType)}>
          <TabsList className="grid w-full grid-cols-3 p-1 bg-white shadow-sm rounded-xl">
            <TabsTrigger 
              value="brain-dump" 
              className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <Brain className="h-5 w-5" />
              <span>Brain Dump</span>
            </TabsTrigger>
            <TabsTrigger 
              value="content-ideas" 
              className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <Lightbulb className="h-5 w-5" />
              <span>Content Ideas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="inspiration" 
              className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <Palette className="h-5 w-5" />
              <span>Inspiration</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brain-dump" className="mt-8">
            <Card className="border rounded-lg p-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Brain Dump</h2>
                <p className="text-muted-foreground text-lg">
                  Quickly jot down all your thoughts and ideas without worrying about organization yet.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 min-h-[400px] mt-6">
                  <p className="text-center text-muted-foreground mt-16">
                    Brain dump content will go here
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="content-ideas" className="mt-8">
            <Card className="border rounded-lg p-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Content Ideas</h2>
                <p className="text-muted-foreground text-lg">
                  Organize your content ideas into categories and refine them for future content creation.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 min-h-[400px] mt-6">
                  <p className="text-center text-muted-foreground mt-16">
                    Content ideas collection will go here
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inspiration" className="mt-8">
            <Card className="border rounded-lg p-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Inspiration</h2>
                <p className="text-muted-foreground text-lg">
                  Save inspiration from around the web and organize visual references for your content.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 min-h-[400px] mt-6">
                  <p className="text-center text-muted-foreground mt-16">
                    Inspiration board will go here
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ContentIdeation;
