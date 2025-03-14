
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

const VisualDevelopment = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-8 fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Visual Development</h1>
          <p className="text-muted-foreground">Create and manage visual assets for your content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-100">
            <CardHeader className="space-y-4">
              <Image className="w-8 h-8 text-primary" />
              <CardTitle>Image Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Generate custom images for your content</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-100">
            <CardHeader className="space-y-4">
              <Image className="w-8 h-8 text-primary" />
              <CardTitle>Asset Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Organize and manage your visual assets</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-100">
            <CardHeader className="space-y-4">
              <Image className="w-8 h-8 text-primary" />
              <CardTitle>Style Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Create consistent visuals with your brand style</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VisualDevelopment;
