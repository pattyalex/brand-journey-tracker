import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { OpenAIService } from "@/utils/OpenAIService";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface MeganAIChatProps {
  onClose: () => void;
  contextData?: {
    title?: string;
    script?: string;
    format?: string;
    shootDetails?: string;
  };
}

const MeganAIChat = ({ onClose, contextData }: MeganAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi there! I'm Megan, your AI content creation assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem("openai_api_key"));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus the input field when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateSystemPrompt = () => {
    let systemPrompt = "You are Megan, an AI content creation assistant. You help creators with content ideas, scripts, format suggestions, and filming/production advice.";

    if (contextData) {
      systemPrompt += " The user is currently working on content with the following details:";
      if (contextData.title) systemPrompt += `\nTitle: ${contextData.title}`;
      if (contextData.script) systemPrompt += `\nScript: ${contextData.script}`;
      if (contextData.format) systemPrompt += `\nFormat: ${contextData.format}`;
      if (contextData.shootDetails) systemPrompt += `\nShoot Details: ${contextData.shootDetails}`;
    }

    systemPrompt += "\nProvide concise, specific, and actionable advice. Focus on content creation best practices, engagement tips, and practical suggestions.";

    return systemPrompt;
  };

  const saveApiKey = (key: string) => {
    localStorage.setItem("openai_api_key", key);
    setApiKey(key);
    toast.success("API key saved successfully!");
  };

  const handleApiKeySubmit = () => {
    const key = prompt("Please enter your OpenAI API key:");
    if (key && key.trim()) {
      saveApiKey(key.trim());
    }
  };

  const callOpenAiApi = async (userMessage: string) => {
    if (!apiKey) {
      return "To enable real AI responses, please add your OpenAI API key. Click the 'Add API Key' button below.";
    }

    try {
      const systemPrompt = generateSystemPrompt();
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add user's new message
      conversationHistory.push({
        role: "user" as const,
        content: userMessage
      });

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using a relatively fast and cheaper model
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("OpenAI API error:", data);
        throw new Error(data.error?.message || "Error calling OpenAI API");
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return "Sorry, I encountered an error. Please try again later or check your API key.";
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!inputValue.trim() || isSubmitting) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSubmitting(true);

    try {
      // Get AI response from OpenAI
      const aiResponse = await callOpenAiApi(userMessage.content);

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get a response from Megan AI");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-primary">Ask Megan</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(90vh-220px)]">
          <div className="p-3 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-2.5 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="p-3 border-t border-gray-200">
        {!apiKey ? (
          <div className="flex flex-col gap-3 items-center justify-center py-2">
            <p className="text-sm text-muted-foreground text-center">
              To enable real AI responses with Megan, you need to add your OpenAI API key.
            </p>
            <Button onClick={handleApiKeySubmit} variant="outline" size="sm">
              Add API Key
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Megan about your content idea..."
              className="min-h-[70px] resize-none text-sm"
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={isSubmitting || !inputValue.trim()}
              className="h-8 w-8 shrink-0 rounded-full"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MeganAIChat;