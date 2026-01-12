
import { toast } from "sonner";
import { StorageKeys, getString } from "@/lib/storage";

export interface OpenAIResponse {
  content: string;
  error?: string;
}

export class OpenAIService {
  // Check if the API key is available
  static hasApiKey(): boolean {
    return getString(StorageKeys.openaiKeySet) === "true";
  }
  
  // Get the API key from local storage
  static getApiKey(): string | null {
    return getString(StorageKeys.openaiApiKey);
  }
  
  // Generate content recommendations based on platform and handle
  static async generateContentRecommendations(
    platform: string, 
    handle: string, 
    count: number = 3
  ): Promise<OpenAIResponse> {
    try {
      const apiKey = this.getApiKey();
      
      if (!apiKey) {
        return {
          content: "",
          error: "OpenAI API key not configured. Please add it in the settings."
        };
      }
      
      const prompt = `You are a social media content strategist helping create recommendations for a creator with username "${handle}" on ${platform}.
Based on current trends and best practices for ${platform}, generate ${count} specific content ideas that would likely perform well.
For each idea, include:
1. A catchy title/hook
2. Brief description of the content (1-2 sentences)
3. Why this would resonate with their audience

Format as a numbered list. Be specific, actionable, and platform-appropriate.`;
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: `Generate content ideas for ${platform} user ${handle}` }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        return {
          content: "",
          error: errorData.error?.message || "Failed to generate recommendations"
        };
      }
      
      const data = await response.json();
      return { content: data.choices[0].message.content };
      
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return {
        content: "",
        error: "Failed to connect to OpenAI. Please try again later."
      };
    }
  }
  
  // Generate optimal posting time recommendations based on platform
  static async generatePostingTimeRecommendations(
    platform: string,
    handle: string
  ): Promise<OpenAIResponse> {
    try {
      const apiKey = this.getApiKey();
      
      if (!apiKey) {
        return {
          content: "",
          error: "OpenAI API key not configured. Please add it in the settings."
        };
      }
      
      const prompt = `You are a social media analytics expert. Based on current research and best practices for ${platform}, provide optimal posting time recommendations for a creator with username "${handle}".
Include:
1. The best days of the week to post
2. The optimal time windows during those days
3. A brief explanation of why these times work well for ${platform}

Be specific and actionable.`;
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: `Generate optimal posting times for ${platform} user ${handle}` }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        return {
          content: "",
          error: errorData.error?.message || "Failed to generate posting time recommendations"
        };
      }
      
      const data = await response.json();
      return { content: data.choices[0].message.content };
      
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return {
        content: "",
        error: "Failed to connect to OpenAI. Please try again later."
      };
    }
  }
}
