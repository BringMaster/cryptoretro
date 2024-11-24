import React from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, Newspaper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NewsArticle } from '@/lib/api';
import { cn } from '@/lib/utils';

interface NewsGridProps {
  news: NewsArticle[];
  loading?: boolean;
}

const NewsGrid: React.FC<NewsGridProps> = ({ news, loading }) => {
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
      <div className="grid grid-cols-1 gap-4">
        {[...Array(9)].map((_, index) => (
          <Card key={index} className="bg-[#1a1a1a] border-gray-800">
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-800 rounded animate-pulse" />
              <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 bg-gray-800 rounded w-24 animate-pulse" />
                <div className="h-4 bg-gray-800 rounded w-16 animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {news.map((article) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <Card className="bg-[#1a1a1a] border-gray-800 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="p-4 md:p-5">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-gray-900 flex items-center justify-center",
                  "md:w-24 md:h-24"
                )}>
                  {article.imageurl ? (
                    <img
                      src={article.imageurl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z"/></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-100 text-lg leading-tight mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{article.body}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      {article.source?.icon && (
                        <img
                          src={article.source.icon}
                          alt={article.source.name}
                          className="w-4 h-4 rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="text-sm text-gray-400 truncate">{article.source?.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-400 flex-shrink-0">
                      <span>{formatTimeAgo(article.published_on)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
};

export default NewsGrid;
