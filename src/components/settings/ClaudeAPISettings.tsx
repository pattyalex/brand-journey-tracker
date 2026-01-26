import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Key, Check, AlertTriangle, Sparkles } from "lucide-react";
import { StorageKeys, getString, remove, setString } from "@/lib/storage";

const ClaudeAPISettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [isKeySet, setIsKeySet] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);

  useEffect(() => {
    const hasKey = getString(StorageKeys.anthropicKeySet) === "true";
    setIsKeySet(hasKey);
    const masked = getString(StorageKeys.anthropicApiKeyMasked);
    if (masked) setMaskedKey(masked);
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    if (!apiKey.startsWith("sk-ant-")) {
      toast.error("This doesn't look like a valid Anthropic API key. API keys typically start with 'sk-ant-'");
      return;
    }

    // Store the actual API key
    setString(StorageKeys.anthropicApiKey, apiKey);

    // Store a masked version for display
    const masked = `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`;
    setString(StorageKeys.anthropicApiKeyMasked, masked);

    // Set the flag indicating the key is set
    setString(StorageKeys.anthropicKeySet, "true");

    setIsKeySet(true);
    setMaskedKey(masked);
    setApiKey("");
    toast.success("Claude API key saved successfully! MegAI will now use Claude.");
  };

  const handleRemoveKey = () => {
    if (confirm("Are you sure you want to remove your Claude API key?")) {
      remove(StorageKeys.anthropicApiKey);
      remove(StorageKeys.anthropicApiKeyMasked);
      remove(StorageKeys.anthropicKeySet);
      setIsKeySet(false);
      setMaskedKey(null);
      toast.info("Claude API key removed");
    }
  };

  return (
    <Card className="w-full border-2 border-[#612A4F]/20">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#612A4F]" />
          Claude API Key (Recommended)
        </CardTitle>
        <CardDescription>
          Connect your Anthropic Claude API key for MegAI script assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isKeySet ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <Check className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-green-700">Claude API key is set and ready to use</p>
              {maskedKey && <p className="text-xs text-green-600 font-mono">{maskedKey}</p>}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-[#612A4F]/5 border border-[#612A4F]/20 rounded-md">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-[#612A4F] shrink-0 mt-0.5" />
                <div className="text-sm text-[#612A4F]">
                  <p className="font-medium mb-1">Recommended for MegAI</p>
                  <p>Claude provides excellent script writing assistance with nuanced, creative suggestions.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="claude-api-key">Anthropic API Key</Label>
              <Input
                id="claude-api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
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
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={handleSaveKey} disabled={!apiKey.trim()} className="bg-[#612A4F] hover:bg-[#4A1F3D]">
              Save API Key
            </Button>
            <p className="text-sm text-muted-foreground">
              Don't have a Claude API key? <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-[#612A4F] hover:underline">Get one here</a>.
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ClaudeAPISettings;
