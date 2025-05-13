
// Service for managing OpenAI API interactions
export class OpenAIService {
  private static readonly API_KEY_STORAGE_KEY = "openai_api_key";
  
  // Save the API key to local storage
  static saveApiKey(apiKey: string): void {
    if (!apiKey || !apiKey.trim()) {
      throw new Error("API key cannot be empty");
    }
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey.trim());
  }
  
  // Get the API key from local storage
  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }
  
  // Remove the API key from local storage
  static removeApiKey(): void {
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
  }
  
  // Check if an API key is stored
  static hasApiKey(): boolean {
    return !!this.getApiKey();
  }
  
  // Call OpenAI API with appropriate error handling
  static async callOpenAI(endpoint: string, payload: any): Promise<any> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error("OpenAI API key not found. Please add your API key in settings.");
    }
    
    try {
      const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }
}
