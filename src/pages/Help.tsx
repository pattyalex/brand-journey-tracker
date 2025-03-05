
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Mail, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Help = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Help Center</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                FAQs
              </CardTitle>
              <CardDescription>
                Find answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Browse FAQs</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Get personalized help from our team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Send Email</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Live Chat
              </CardTitle>
              <CardDescription>
                Chat with a support representative
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Start Chat</Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I create a new content pillar?</AccordionTrigger>
                <AccordionContent>
                  Navigate to the Content Ideation page and click on "Create New Pillar". Fill out the form with your pillar details and click Save.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Can I export my content calendar?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can export your content calendar by going to the Content Calendar page and clicking on the "Export" button in the top-right corner.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>How do I track my income from content?</AccordionTrigger>
                <AccordionContent>
                  Use the Income Tracker page to add and monitor your revenue streams. You can categorize income by platform and content type for detailed analytics.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>What's the Bank of Ideas for?</AccordionTrigger>
                <AccordionContent>
                  The Bank of Ideas helps you store and organize content ideas. When you're ready to create content, you can pull from this bank to never run out of ideas.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>How do I customize my sidebar?</AccordionTrigger>
                <AccordionContent>
                  You can add new pages to your sidebar by clicking the "+" button next to the Menu label. You can also delete custom pages by hovering over them and clicking the trash icon.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Help;
