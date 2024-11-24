import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getNews, type NewsArticle } from '../lib/api';
import { Skeleton } from './ui/skeleton';

interface NewsSectionProps {
  assetName?: string;
  assetSymbol?: string;
}

const NewsSection = ({ assetName, assetSymbol }: NewsSectionProps) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedNews = await getNews({
          limit: 20, // Fetch more news to ensure we have enough after filtering
          assetSymbol: assetSymbol
        });
        setNews(fetchedNews);
      } catch (error: unknown) {
        console.error('Error fetching news:', error);
        setError(error instanceof Error ? error.message : 'Failed to load news');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [assetSymbol]);

  const formatTimeAgo = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="cyber-heading text-2xl font-bold">
          {assetName ? `${assetName} Latest News` : 'Latest News'}
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="bg-black/40 backdrop-blur-sm border border-purple-500/20 p-4">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="cyber-heading text-2xl font-bold">
          {assetName ? `${assetName} Latest News` : 'Latest News'}
        </h2>
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-500/20 p-6 text-center">
          <p className="text-red-400">{error}</p>
        </Card>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="cyber-heading text-2xl font-bold">
          {assetName ? `${assetName} Latest News` : 'Latest News'}
        </h2>
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-500/20 p-6 text-center">
          <p className="text-gray-400">No news available for {assetName || assetSymbol}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="cyber-heading text-2xl font-bold">
        {assetName ? `${assetName} Latest News` : 'Latest News'}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {news.slice(0, 3).map((article) => (
          <Card 
            key={article.id} 
            className="bg-black/40 backdrop-blur-sm border border-purple-500/20 p-4 hover:bg-gray-800/50 transition-colors"
          >
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white line-clamp-2 hover:text-purple-400 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {article.body}
                </p>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-2">
                    {article.source.icon && (
                      <img
                        src={article.source.icon}
                        alt={article.source.name}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span className="text-gray-400">{article.source.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <span>{formatTimeAgo(article.published_on)}</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;