

import TrendingFeed from "@/components/trending/TrendingFeed";

const TrendingContent = () => {
  return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">What's Trending</h1>
          <p className="text-muted-foreground">Discover trending content in your niche</p>
        </div>
        <TrendingFeed />
      </div>
  );
};

export default TrendingContent;
