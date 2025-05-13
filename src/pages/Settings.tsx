import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import OpenAISettings from "@/components/settings/OpenAISettings";

const Settings = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 fade-in">
        <h1 className="text-4xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="ai">AI Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value="Pedro Duarte" className="h-9" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value="@peduarte" className="h-9" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize your appearance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifs" className="flex-1">Email Notifications</Label>
              <Switch id="email-notifs" defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifs" className="flex-1">Push Notifications</Label>
              <Switch id="push-notifs" defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder-notifs" className="flex-1">Content Reminders</Label>
              <Switch id="reminder-notifs" defaultChecked={true} />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => toast.success("Notification settings saved!")}
              className="ml-auto"
            >
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="ai">
        <Card className="border-none shadow-none">
          <CardContent className="px-0 pt-6">
            <OpenAISettings />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;