
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BackButton from "@/components/BackButton";

const Auth = () => {
  const navigate = useNavigate();

  const navigateTo = (route: string) => {
    navigate(route);
  };

  return (
    <Layout>
      <div className="fade-in max-w-md mx-auto mt-12">
        <div className="mb-4">
          <BackButton />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">Content Creation Tools</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start text-lg py-6"
                onClick={() => navigateTo("/content-ideation")}
              >
                <Brain className="mr-3 h-5 w-5" />
                Brain Dump
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-lg py-6"
                onClick={() => navigateTo("/content-ideas")}
              >
                <Lightbulb className="mr-3 h-5 w-5" />
                Content Ideas
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-lg py-6"
                onClick={() => navigateTo("/content-ideation")}
              >
                <Palette className="mr-3 h-5 w-5" />
                Inspiration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
