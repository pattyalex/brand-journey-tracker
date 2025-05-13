
import { FirecrawlService } from './FirecrawlService';

export type Recommendation = {
  type: string;
  title: string;
  content: string;
};

export class AIRecommendationService {
  // Get recommendations based on connected platform data
  static async getRecommendations(platforms: string[]): Promise<Recommendation[]> {
    // If no platforms are connected, return default recommendations
    if (!platforms || platforms.length === 0) {
      return this.getDefaultRecommendations();
    }
    
    try {
      // In a real implementation, this would analyze data from the connected platforms
      // For now, we'll generate recommendations based on the connected platform names
      const recommendations: Recommendation[] = [];
      
      if (platforms.includes('Instagram')) {
        recommendations.push({
          type: 'content-idea',
          title: 'Content Idea',
          content: 'Based on your Instagram analytics, carousel posts with tutorials are getting 2.5x more engagement. Consider creating a step-by-step guide this week.'
        });
      }
      
      if (platforms.includes('TikTok')) {
        recommendations.push({
          type: 'posting-time',
          title: 'Optimal Posting Time',
          content: 'Your TikTok engagement is highest between 7-9pm on weekdays. Try scheduling your next viral attempt during this window.'
        });
      }
      
      if (platforms.includes('YouTube')) {
        recommendations.push({
          type: 'content-length',
          title: 'Content Length',
          content: 'Your YouTube analytics show videos between 8-12 minutes have the highest retention. Aim for this sweet spot in your next upload.'
        });
      }
      
      if (platforms.includes('LinkedIn')) {
        recommendations.push({
          type: 'engagement-tip',
          title: 'Engagement Strategy',
          content: 'LinkedIn posts with questions at the beginning see 50% more comments. Try starting your next post with a thought-provoking question.'
        });
      }
      
      // If we have more than 2 recommendations, just return the first 2
      if (recommendations.length > 2) {
        return recommendations.slice(0, 2);
      }
      
      // If we have fewer than 2 recommendations, add some defaults
      while (recommendations.length < 2) {
        const defaults = this.getDefaultRecommendations();
        recommendations.push(defaults[recommendations.length]);
      }
      
      return recommendations;
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      return this.getDefaultRecommendations();
    }
  }
  
  // Default recommendations when no platforms are connected or errors occur
  static getDefaultRecommendations(): Recommendation[] {
    return [
      {
        type: 'content-idea',
        title: 'Content Idea',
        content: 'Based on your recent analytics, your audience responds well to tutorial-style content. Consider creating more how-to videos this week.'
      },
      {
        type: 'posting-time',
        title: 'Optimal Posting Time',
        content: 'Your engagement is highest between 6-8pm on weekdays. Try scheduling your next post during this window.'
      }
    ];
  }
  
  // Method to get more recommendations (could be expanded in the future)
  static async getMoreRecommendations(platforms: string[]): Promise<Recommendation[]> {
    const baseRecommendations = await this.getRecommendations(platforms);
    const additionalRecommendations: Recommendation[] = [
      {
        type: 'hashtag-strategy',
        title: 'Hashtag Strategy',
        content: 'Using 5-7 highly relevant hashtags performs better than using maximum allowed hashtags. Focus on quality over quantity.'
      },
      {
        type: 'content-series',
        title: 'Content Series Idea',
        content: 'Creating a weekly series increases return viewers by 40%. Consider a consistent theme like "Tuesday Tips" or "Feature Friday".'
      }
    ];
    
    return [...baseRecommendations, ...additionalRecommendations];
  }
}
