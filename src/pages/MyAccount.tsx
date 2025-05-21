
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
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <p className="text-muted-foreground">No payment methods added yet.</p>
                  </div>
                  <Button>Add Payment Method</Button>
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
