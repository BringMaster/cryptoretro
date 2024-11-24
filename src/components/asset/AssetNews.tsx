import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from 'lucide-react';
import './AssetNews.css';

interface AssetNewsProps {
  assetSymbol: string;
}

interface NewsItem {
  id: string;
  title: string;
  url: string;
  body: string;
  source: string;
  published_on: number;
}

export function AssetNews({ assetSymbol }: AssetNewsProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://min-api.cryptocompare.com/data/v2/news/?categories=${assetSymbol.toLowerCase()}&excludeCategories=Sponsored`,
          {
            headers: {
              'Authorization': `Apikey ${import.meta.env.VITE_CRYPTOCOMPARE_API_KEY}`
            }
          }
        );
        const data = await response.json();
        if (data.Data) {
          // Limit to 10 news items
          setNews(data.Data.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [assetSymbol]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="w-full bg-zinc-900/40 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-zinc-400">Loading news...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-[#0a0a0a] backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0a]">
      <CardHeader className="border-b border-zinc-800/40">
        <CardTitle className="text-zinc-100">Latest {assetSymbol} News</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[600px] overflow-y-auto pr-4 custom-scrollbar">
          <div className="space-y-3">
            {news.map((item) => (
              <Card 
                key={item.id} 
                className="bg-zinc-900/60 border-zinc-800/40 group cursor-pointer hover:bg-zinc-800/40 transition-all duration-200" 
                onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
              >
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-medium text-sm leading-tight text-zinc-200 group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <span 
                        className="text-emerald-400 hover:text-emerald-300 flex-shrink-0 mt-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{item.body}</p>
                    <div className="flex justify-between items-center text-xs text-zinc-500">
                      <span>{item.source}</span>
                      <span>{formatDate(item.published_on)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
