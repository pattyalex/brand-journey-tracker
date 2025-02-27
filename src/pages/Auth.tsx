
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";

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
            <CardDescription>Sign in to manage your content creation journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" placeholder="Enter your password" />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">Sign In</Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/signup" className="text-primary hover:underline">
                Sign up
              </a>
            </div>
            <div className="pt-4 text-center space-x-4">
              <Button variant="outline" onClick={goToDashboard}>
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
