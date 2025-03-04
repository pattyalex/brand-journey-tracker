
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
        
        <Tabs defaultValue="payment" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
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
                  <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                    <h3 className="text-lg font-medium">Current Plan: Free</h3>
                    <p className="text-muted-foreground mt-2">You're currently on the free plan with limited features.</p>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="border-2 border-primary">
                      <CardHeader>
                        <CardTitle>Premium Plan</CardTitle>
                        <CardDescription>Best for professionals</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">$9.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <ul className="mt-4 space-y-2">
                          <li className="flex items-center">✓ Unlimited projects</li>
                          <li className="flex items-center">✓ Advanced features</li>
                          <li className="flex items-center">✓ Priority support</li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Upgrade Now</Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Business Plan</CardTitle>
                        <CardDescription>For teams and organizations</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">$29.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <ul className="mt-4 space-y-2">
                          <li className="flex items-center">✓ Team collaboration</li>
                          <li className="flex items-center">✓ Advanced analytics</li>
                          <li className="flex items-center">✓ Dedicated support</li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">Contact Sales</Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyAccount;
