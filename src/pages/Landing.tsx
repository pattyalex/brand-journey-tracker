import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-purple-800">Hey Megan</h1>
        <p className="text-xl mt-4 text-gray-600 max-w-md mx-auto">
          Your all-in-one content creation and management platform
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg border-purple-100 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-700">7-Day Free Trial</CardTitle>
            <CardDescription>Get started with Hey Megan today</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Content planning tools
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI content recommendations
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Social media analytics
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleGetStarted} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Start Free Trial
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg border-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-700">Existing Users</CardTitle>
            <CardDescription>Welcome back to Hey Megan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Already have an account? Log in to access your content dashboard, analytics, and more.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleLogin} 
              variant="outline" 
              className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Log In
            </Button>
          </CardFooter>
        </Card>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}