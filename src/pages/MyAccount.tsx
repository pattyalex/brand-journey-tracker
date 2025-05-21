
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, User, Wallet } from 'lucide-react';

const MyAccount = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">My Account</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Manage your personal information and account details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <p className="text-muted-foreground">Profile information will appear here.</p>
                  </div>
                  <Button>Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="membership">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Membership
                </CardTitle>
                <CardDescription>
                  View and manage your current membership plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Trial Status Banner */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <span className="inline-block h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>
                          Free Trial Active
                        </h3>
                        <p className="text-muted-foreground mt-2">
                          Your 7-day free trial ends on <span className="font-medium">May 30, 2025</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          You'll be automatically charged $17.00 on May 30, 2025 unless you cancel.
                        </p>
                      </div>
                      <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                        Cancel Trial
                      </Button>
                    </div>
                  </div>
                  
                  {/* Current Plan Details */}
                  <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">Current Plan: Premium Monthly</h3>
                        <p className="text-muted-foreground mt-2">
                          $17.00 per month, billed monthly
                        </p>
                        <p className="text-sm mt-2">
                          Next billing date: <span className="font-medium">May 30, 2025</span>
                        </p>
                      </div>
                      <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Monthly Plan Card */}
                    <Card className="border-2 border-primary">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>Monthly Plan</CardTitle>
                          <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                            Current Plan
                          </span>
                        </div>
                        <CardDescription>Best for flexibility</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">$17<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <ul className="mt-4 space-y-2">
                          <li className="flex items-center">✓ Unlimited projects</li>
                          <li className="flex items-center">✓ Advanced features</li>
                          <li className="flex items-center">✓ Priority support</li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" disabled>Current Plan</Button>
                      </CardFooter>
                    </Card>
                    
                    {/* Annual Plan Card */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle>Annual Plan</CardTitle>
                        <CardDescription>Best savings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">$14<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <p className="text-xs text-muted-foreground mb-2">Billed annually ($168)</p>
                        <ul className="mt-4 space-y-2">
                          <li className="flex items-center">✓ Everything in monthly</li>
                          <li className="flex items-center">✓ 18% savings</li>
                          <li className="flex items-center">✓ Locked-in rate</li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">Switch to Annual</Button>
                      </CardFooter>
                    </Card>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                    <p>
                      <strong>Cancellation Policy:</strong> If you cancel your subscription, you'll continue to have access until the end of your current billing period. No refunds are provided for unused portions of your subscription.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your payment methods and billing information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Saved Cards Section */}
                  <div className="bg-card rounded-lg border">
                    <div className="p-5 border-b">
                      <h3 className="text-lg font-medium">Saved Payment Methods</h3>
                    </div>
                    
                    {/* Example card on file - this would be replaced with data from your payment provider */}
                    <div className="p-5 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 w-12 h-8 rounded flex items-center justify-center text-white">
                          <span className="text-xs font-bold">VISA</span>
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 05/28</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Default</Badge>
                        <Button variant="ghost" size="sm">Remove</Button>
                      </div>
                    </div>
                    
                    {/* Add Payment Method Button */}
                    <div className="p-5">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => {
                          // Open a dialog or form for adding a new payment method
                          // This would be connected to your payment processor
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        Add Payment Method
                      </Button>
                    </div>
                  </div>
                  
                  {/* Billing Address Section */}
                  <div className="bg-card rounded-lg border">
                    <div className="p-5 border-b">
                      <h3 className="text-lg font-medium">Billing Address</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p>John Doe</p>
                          <p className="text-muted-foreground">
                            123 Main Street<br />
                            Apt 4B<br />
                            New York, NY 10001<br />
                            United States
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment History Link */}
                  <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                    <span>View your payment history</span>
                    <Button variant="outline" size="sm">
                      View History
                    </Button>
                  </div>
                  
                  {/* Payment Security Note */}
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                    Your payment information is securely stored and processed.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyAccount;
