
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <div className="text-2xl font-bold">Hey Megan</div>
        <nav className="flex items-center gap-4">
          <Link to="/onboarding" className="text-sm font-medium hover:underline">Sign Up</Link>
          <Button variant="outline" asChild>
            <Link to="/login">Login</Link>
          </Button>
        </nav>
      </header>
      
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
            Your AI-Powered Social Media Assistant
          </h1>
          <p className="max-w-[700px] text-lg md:text-xl text-gray-500 mb-8">
            Say hello to smarter content planning, AI recommendations, and simplified social media management.
          </p>
          <Button className="h-12 px-8 text-base" size="lg" asChild>
            <Link to="/onboarding">
              Start your 7-day free trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-gray-500 mt-3">No credit card required to start</p>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 md:py-24 container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Everything you need to succeed on social</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 border rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h2"></path><path d="M8 17h2"></path><path d="M14 13h2"></path><path d="M14 17h2"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Content Planning</h3>
            <p className="text-gray-500">Plan your content calendar weeks in advance with AI-powered recommendations.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 border rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 20v-6M9 20v-4M6 20v-2M15 20v-2M18 20v-4"></path><path d="M4 4v4a8 8 0 0 0 16 0V4"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500">Track performance and growth across all your social platforms in one place.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 border rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">AI Recommendations</h3>
            <p className="text-gray-500">Get personalized content ideas and optimal posting times based on your data.</p>
          </div>
        </div>
      </section>
      
      {/* Pricing */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-12">Simple, transparent pricing</h2>
          <div className="max-w-md mx-auto border rounded-lg overflow-hidden">
            <div className="p-6 bg-white">
              <h3 className="text-2xl font-bold mb-2">Hey Megan Pro</h3>
              <div className="text-4xl font-bold mb-4">$17<span className="text-lg text-gray-500 font-normal">/month</span></div>
              <p className="text-gray-500 mb-6">Everything you need to manage your social media presence</p>
              <ul className="space-y-3 text-left mb-6">
                {[
                  "Unlimited content planning",
                  "AI-powered content recommendations",
                  "Analytics across all platforms",
                  "Content calendar & scheduling",
                  "Unlimited social accounts"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <Link to="/onboarding">Start 7-day free trial</Link>
              </Button>
              <p className="text-sm text-gray-500 mt-3">No credit card required to start</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to transform your social media strategy?</h2>
          <p className="text-gray-500 max-w-[600px] mx-auto mb-8">
            Join thousands of content creators and social media managers who are saving time and creating better content with Hey Megan.
          </p>
          <Button className="h-12 px-8 text-base" size="lg" asChild>
            <Link to="/onboarding">
              Start your free trial today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-gray-500">
            © 2023 Hey Megan. All rights reserved.
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:underline">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:underline">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
