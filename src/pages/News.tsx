import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getNews } from '@/lib/api';
import NewsGrid from '@/components/NewsGrid';
import Pagination from '@/components/Pagination';
import { Card } from '@/components/ui/card';
import TopCryptos from '@/components/TopCryptos';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewsArticle {
  id: string;
  published_on: number;
  imageurl: string;
  title: string;
  url: string;
  body: string;
  categories: string[];
  source: {
    id: string;
    name: string;
    url: string;
    icon?: string;
  };
}

const NEWS_SOURCES = [
  { id: 'all', name: 'All Sources' },
  { id: 'cryptocompare', name: 'CryptoCompare' },
  { id: 'cointelegraph', name: 'CoinTelegraph' },
  { id: 'coindesk', name: 'CoinDesk' },
  { id: 'cryptoslate', name: 'CryptoSlate' },
  { id: 'decrypt', name: 'Decrypt' },
  { id: 'bitcoinist', name: 'Bitcoinist' },
  { id: 'newsbtc', name: 'NewsBTC' },
  { id: 'bitcoin.com', name: 'Bitcoin.com' },
  { id: 'beincrypto', name: 'BeInCrypto' }
];

const News = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentSource = searchParams.get('source') || 'all';
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await getNews({
          page: currentPage,
          limit: ITEMS_PER_PAGE * 3, // Get more news to ensure we have enough after filtering
        });

        // Ensure all articles have the required properties with proper type handling
        const processedData = data.map(article => ({
          ...article,
          imageurl: article.imageurl || '',  // Provide default empty string for optional imageurl
          categories: article.categories || [], // Ensure categories is always an array
          tags: article.tags || [] // Ensure tags is always an array
        }));

        setAllNews(processedData);

        // Filter by source if needed
        const filteredNews = currentSource === 'all' 
          ? processedData 
          : processedData.filter((article: NewsArticle) => {
              if (!article) return false;
              
              const sourceId = article.source?.id?.toLowerCase() || '';
              const url = article.url?.toLowerCase() || '';
              
              switch (currentSource) {
                case 'all':
                  return true;
                case 'cryptocompare':
                  return sourceId === 'cryptocompare';
                case 'cointelegraph':
                  return sourceId === 'cointelegraph';
                case 'coindesk':
                  return sourceId === 'coindesk';
                default:
                  return false;
              }
            });

        // Calculate start and end index for current page
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        
        // Get current page's news
        const paginatedNews = filteredNews.slice(startIndex, endIndex);
        
        setNews(paginatedNews);
        setTotalPages(Math.max(1, Math.ceil(filteredNews.length / ITEMS_PER_PAGE)));
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [currentPage, currentSource]);

  const handlePageChange = (page: number) => {
    setSearchParams(prev => {
      prev.set('page', page.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSourceChange = (source: string) => {
    setSearchParams(prev => {
      prev.set('source', source);
      prev.set('page', '1'); // Reset to first page when changing source
      return prev;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Crypto News</h1>
            <div className="w-[200px]">
              <Select
                value={currentSource}
                onValueChange={handleSourceChange}
              >
                <SelectTrigger className="bg-[#1a1a1a] border-gray-700">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {NEWS_SOURCES.map(source => (
                    <SelectItem 
                      key={source.id} 
                      value={source.id}
                      className="cursor-pointer"
                    >
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <NewsGrid news={news} loading={loading} />

          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        <div className="space-y-6">
          <TopCryptos />
        </div>
      </div>
    </div>
  );
};

export default News;
