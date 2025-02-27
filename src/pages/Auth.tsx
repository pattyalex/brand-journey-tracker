
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const goToContentIdeation = () => {
    navigate("/content-ideation");
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-20 fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to HeyMegan</CardTitle>
            <CardDescription>Choose where you want to go</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-4">
              <Button className="w-full" onClick={goToDashboard}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={goToContentIdeation}>
                Content Ideation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
