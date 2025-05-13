
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Key } from "lucide-react";
import { toast } from "sonner";

const OpenAISettings: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [isKeySet, setIsKeySet] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [storedKey, setStoredKey] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if the key is stored
    const hasKey = localStorage.getItem("openai_key_set") === "true";
    setIsKeySet(hasKey);
    
    // Try to get the masked key for display
    const key = localStorage.getItem("openai_api_key_masked");
    if (key) {
      setStoredKey(key);
    }
  }, []);
  
  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    if (!apiKey.startsWith("sk-")) {
      toast.error("This doesn't look like a valid OpenAI API key. API keys typically start with 'sk-'");
      return;
    }
    
    try {
      // Store the actual key securely
      localStorage.setItem("openai_api_key", apiKey);
      
      // Store a masked version for display
      const maskedKey = `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`;
      localStorage.setItem("openai_api_key_masked", maskedKey);
      
      // Set the flag indicating the key is set
      localStorage.setItem("openai_key_set", "true");
      
      setIsKeySet(true);
      setStoredKey(maskedKey);
      setApiKey("");
      toast.success("OpenAI API key saved successfully");
    } catch (error) {
      toast.error("Failed to save API key");
      console.error("Error saving API key:", error);
    }
  };
  
  const handleRemoveKey = () => {
    if (window.confirm("Are you sure you want to remove your OpenAI API key? This will disable AI-powered recommendations.")) {
      localStorage.removeItem("openai_api_key");
      localStorage.removeItem("openai_api_key_masked");
      localStorage.removeItem("openai_key_set");
      setIsKeySet(false);
      setStoredKey(null);
      toast.info("OpenAI API key removed");
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Key className="h-5 w-5" />
          OpenAI API Integration
        </CardTitle>
        <CardDescription>
          Connect your OpenAI API key to enable AI-powered content recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isKeySet ? (
          <>
            <div className="flex items-center justify-between p-3 bg-primary-foreground/10 rounded-md">
              <div>
                <p className="text-sm font-medium">API Key</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {storedKey || "••••••••••••••••••••"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRemoveKey}>
                Remove Key
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Your OpenAI API key is set and AI-powered recommendations are enabled.
            </p>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your OpenAI API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowKey(!showKey)}
                  className="h-10 w-10"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key will be stored securely in your browser's local storage.
              </p>
            </div>
            <Button onClick={handleSaveKey}>Save API Key</Button>
            <p className="text-sm text-muted-foreground">
              Don't have an OpenAI API key? <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get one here</a>.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OpenAISettings;
