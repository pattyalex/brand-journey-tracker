
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OpenAIService } from "@/utils/OpenAIService";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, AlertCircle, Check, Key } from "lucide-react";

interface OpenAISettingsProps {
  onClose?: () => void;
}

const OpenAISettings: React.FC<OpenAISettingsProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Check if API key exists
    const existingKey = OpenAIService.getApiKey();
    if (existingKey) {
      // Only show masked version of the key
      setSavedKey(maskApiKey(existingKey));
    }
  }, []);

  const maskApiKey = (key: string): string => {
    if (key.length <= 8) return "••••••••";
    return key.substring(0, 4) + "••••••••" + key.substring(key.length - 4);
  };

  const handleSaveKey = async () => {
    try {
      setIsSaving(true);
      OpenAIService.saveApiKey(apiKey);
      toast.success("API key saved successfully!");
      setSavedKey(maskApiKey(apiKey));
      setApiKey("");
      setTestResult(null);
    } catch (error) {
      toast.error("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = () => {
    const confirmed = window.confirm("Are you sure you want to remove your API key?");
    if (confirmed) {
      OpenAIService.removeApiKey();
      setSavedKey(null);
      toast.success("API key removed");
      setTestResult(null);
    }
  };

  const testApiKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Use a simple request to test the API key
      await OpenAIService.callOpenAI("chat/completions", {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello, this is a test message to verify my API key works." }
        ],
        max_tokens: 20
      });
      
      setTestResult({
        success: true,
        message: "API key is valid and working correctly!"
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || "Failed to validate API key"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          OpenAI API Settings
        </CardTitle>
        <CardDescription>
          Add your OpenAI API key to enable AI features throughout the application
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {savedKey ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{savedKey}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleRemoveKey}>
                Remove
              </Button>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={testApiKey}
                disabled={isTesting}
              >
                {isTesting ? "Testing..." : "Test API Key"}
              </Button>
              
              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {testResult.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className={savedKey ? "justify-end" : "justify-between"}>
        {!savedKey && (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveKey} 
              disabled={!apiKey.trim() || isSaving}
            >
              {isSaving ? "Saving..." : "Save API Key"}
            </Button>
          </>
        )}
        {savedKey && onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OpenAISettings;
