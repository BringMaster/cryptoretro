import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getNews } from '../lib/api';

interface NewsArticle {
  id: string;
  guid: string;
  published_on: number;
  imageurl: string;
  title: string;
  url: string;
  source: string;
  body: string;
  tags: string;
  categories: string;
  upvotes: string;
  downvotes: string;
  source_info: {
    name: string;
    img: string;
  };
}

interface NewsSectionProps {
  assetName?: string;
  assetSymbol?: string;
}

const NewsSection = ({ assetName, assetSymbol }: NewsSectionProps) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [sortedNews, setSortedNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const fetchedNews = await getNews(assetName || assetSymbol);
        setNews(fetchedNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, [assetName, assetSymbol]);

  useEffect(() => {
    const sorted = [...news]
      .sort((a, b) => b.published_on - a.published_on)
      .slice(0, 5);
    setSortedNews(sorted);
  }, [news]);

  const formatTimeAgo = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="cyber-heading text-2xl font-bold">
        {assetName ? `${assetName} News` : 'Latest News'}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {sortedNews.map((article) => (
          <Card key={article.id} className="bg-black/40 backdrop-blur-sm border border-purple-500/20 p-4 hover:bg-gray-800/50 transition-colors">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white line-clamp-2">
                {article.title}
              </h3>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>{formatTimeAgo(article.published_on)}</span>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center hover:text-white transition-colors"
                >
                  Read More <ExternalLink className="ml-1 w-4 h-4" />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;