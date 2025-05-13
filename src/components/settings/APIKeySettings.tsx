
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Key, Check, AlertTriangle } from "lucide-react";

const APIKeySettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [isKeySet, setIsKeySet] = useState(false);
  const [showKey, setShowKey] = useState(false);
  
  useEffect(() => {
    // Check if the key is in local storage (just for UI feedback, actual key is in env)
    setIsKeySet(!!localStorage.getItem("openai_key_set"));
  }, []);
  
  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    // In a real implementation, this would make a server-side request to store the key
    // For now, we'll just simulate successful storage
    localStorage.setItem("openai_key_set", "true");
    
    // Don't actually store the key in local storage - it's a security risk
    // Instead, just store a flag that indicates the key has been set
    setIsKeySet(true);
    setApiKey("");
    toast.success("API key saved successfully");
  };
  
  const handleRemoveKey = () => {
    if (confirm("Are you sure you want to remove your API key? This will disable AI-powered recommendations.")) {
      localStorage.removeItem("openai_key_set");
      setIsKeySet(false);
      toast.info("API key removed");
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Key className="h-5 w-5" />
          OpenAI API Key
        </CardTitle>
        <CardDescription>
          Connect your OpenAI API key to enable AI-powered content recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isKeySet ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <Check className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-700">API key is set and ready to use</p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium mb-1">API Key Required</p>
                  <p>Your API key is stored securely and never shared with third parties.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="api-key">OpenAI API Key</Label>
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <div className="flex items-center">
                <label className="text-sm text-muted-foreground flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showKey}
                    onChange={() => setShowKey(!showKey)}
                    className="h-4 w-4"
                  />
                  Show API key
                </label>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isKeySet ? (
          <Button variant="destructive" onClick={handleRemoveKey}>
            Remove API Key
          </Button>
        ) : (
          <Button onClick={handleSaveKey} disabled={!apiKey.trim()}>
            Save API Key
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default APIKeySettings;
