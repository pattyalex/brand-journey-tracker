
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon, XIcon } from "lucide-react";

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
      content: "Hi there! I'm Megan, your content creation assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    // Simulate AI response
    setTimeout(() => {
      let response: string;
      
      // Generate contextual response based on user input
      if (inputValue.toLowerCase().includes("idea") || inputValue.toLowerCase().includes("suggest")) {
        response = "I see you're working on a content idea! I can help you develop it further. What type of content are you thinking about?";
      } else if (inputValue.toLowerCase().includes("script")) {
        response = "Need help with your script? I can suggest hooks, dialog, or help structure your content for better engagement.";
      } else if (inputValue.toLowerCase().includes("format")) {
        response = "For your format, consider what works best on your target platform. For example, short-form educational content works well on TikTok and Instagram Reels.";
      } else if (inputValue.toLowerCase().includes("shoot") || inputValue.toLowerCase().includes("filming")) {
        response = "For your shoot, make sure you have good lighting and clear audio. These are the two most important factors for professional-looking content.";
      } else {
        response = "I'm here to help with your content creation! I can suggest ideas, help with scripts, recommend formats, or offer shooting tips. What would you like assistance with?";
      }
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsSubmitting(false);
    }, 1000);
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
        <div>
          <h2 className="text-lg font-semibold text-primary">Ask Megan</h2>
          <p className="text-xs text-gray-500">your AI content creation assistant</p>
        </div>
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
      </div>
    </div>
  );
};

export default MeganAIChat;
