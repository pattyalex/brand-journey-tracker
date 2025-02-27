
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const Auth = () => {
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
            <div className="pt-4 text-center">
              <Link to="/dashboard" className="text-primary hover:underline">
                Go to Dashboard
              </Link>
              {" | "}
              <Link to="/content-ideation" className="text-primary hover:underline">
                Content Ideation
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
