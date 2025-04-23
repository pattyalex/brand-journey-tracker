
import FirecrawlApp from '@mendable/firecrawl-js';

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async crawlSocialContent(platform: string): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      let targetUrl;
      switch (platform.toLowerCase()) {
        case 'instagram':
          targetUrl = 'https://www.instagram.com/explore/';
          break;
        case 'youtube':
          targetUrl = 'https://www.youtube.com/feed/trending';
          break;
        case 'tiktok':
          targetUrl = 'https://www.tiktok.com/foryou';
          break;
        default:
          targetUrl = 'https://www.instagram.com/explore/';
      }

      const crawlResponse = await this.firecrawlApp.crawlUrl(targetUrl, {
        limit: 20,
        scrapeOptions: {
          formats: ['markdown', 'html'],
        }
      }) as CrawlResponse;

      if (!crawlResponse.success) {
        return { 
          success: false, 
          error: (crawlResponse as ErrorResponse).error || 'Failed to crawl content' 
        };
      }

      return { 
        success: true,
        data: crawlResponse 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}
