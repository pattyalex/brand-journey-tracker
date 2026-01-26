import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import APIKeySettings from "@/components/settings/APIKeySettings";
import OpenAISettings from "@/components/settings/OpenAISettings";
import ClaudeAPISettings from "@/components/settings/ClaudeAPISettings";
import { Globe, Check } from "lucide-react";
import { StorageKeys, getString, setString } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Timezone options
const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'PST', name: 'Pacific Time', offset: 'UTC-8' },
  { value: 'America/Denver', label: 'MST', name: 'Mountain Time', offset: 'UTC-7' },
  { value: 'America/Chicago', label: 'CST', name: 'Central Time', offset: 'UTC-6' },
  { value: 'America/New_York', label: 'EST', name: 'Eastern Time', offset: 'UTC-5' },
  { value: 'Europe/London', label: 'GMT', name: 'Greenwich Mean Time', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'CET', name: 'Central European Time', offset: 'UTC+1' },
  { value: 'Asia/Tokyo', label: 'JST', name: 'Japan Standard Time', offset: 'UTC+9' },
  { value: 'Australia/Sydney', label: 'AEST', name: 'Australian Eastern Time', offset: 'UTC+10' },
];

const Settings = () => {
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    return getString(StorageKeys.selectedTimezone) || 'auto';
  });

  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone);
    setString(StorageKeys.selectedTimezone, timezone);
    toast.success('Timezone updated');
  };
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 fade-in">
        <h1 className="text-4xl font-bold mb-6">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="Your email" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Timezone Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Timezone
            </CardTitle>
            <CardDescription>
              Set your preferred timezone for the planner and calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <button
                onClick={() => handleTimezoneChange('auto')}
                className={cn(
                  "w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors",
                  selectedTimezone === 'auto'
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span>Auto (detect from browser)</span>
                  {selectedTimezone === 'auto' && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
              </button>
              <div className="h-px bg-gray-100 my-2"></div>
              {TIMEZONES.map((tz) => (
                <button
                  key={tz.value}
                  onClick={() => handleTimezoneChange(tz.value)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors",
                    selectedTimezone === tz.value
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span>{tz.label}</span>
                      <span className="text-xs text-gray-400">{tz.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{tz.offset}</span>
                      {selectedTimezone === tz.value && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Claude API Integration - Recommended */}
        <ClaudeAPISettings />

        {/* OpenAI API Integration - Alternative */}
        <APIKeySettings />

        {/* OpenAI API Integration */}
        <OpenAISettings />

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Notification settings would go here */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Get emails for important updates
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in browser
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Digest</h4>
                <p className="text-sm text-muted-foreground">
                  Get a weekly summary of your content performance
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Calendar Sync</p>
                <p className="text-sm text-muted-foreground">Connect your calendar for better scheduling</p>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;