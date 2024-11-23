import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { getAssets } from '@/lib/api';

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  priceUsd: string;
  changePercent24Hr: string;
}

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchAssets = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const allAssets = await getAssets();
        const filteredResults = allAssets
          .filter((asset: SearchResult) => 
            asset.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
            asset.symbol.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
          .slice(0, 5);
        setResults(filteredResults);
      } catch (error) {
        console.error('Error searching assets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchAssets();
  }, [debouncedQuery]);

  const handleResultClick = (id: string) => {
    navigate(`/asset/${id}`);
    setShowResults(false);
    setQuery('');
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
  };

  const formatChange = (change: string) => {
    const numChange = parseFloat(change);
    return {
      text: `${Math.abs(numChange).toFixed(2)}%`,
      isPositive: numChange >= 0
    };
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search cryptocurrencies..."
          className="pl-10 pr-4 h-11 bg-background/50 backdrop-blur border-secondary/20 hover:border-secondary/40 focus:border-secondary transition-colors"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
          </div>
        )}
      </div>

      {showResults && (query.trim() || results.length > 0) && (
        <Card className="absolute z-50 w-full mt-2 p-2 bg-background/95 backdrop-blur border-secondary/20 shadow-lg">
          {results.length > 0 ? (
            <ul className="space-y-1">
              {results.map((result) => {
                const change = formatChange(result.changePercent24Hr);
                return (
                  <li
                    key={result.id}
                    onClick={() => handleResultClick(result.id)}
                    className="p-2 hover:bg-secondary/10 rounded-md cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{result.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {result.symbol}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono">
                          {formatPrice(result.priceUsd)}
                        </div>
                        <div
                          className={`text-xs ${
                            change.isPositive ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {change.isPositive ? '↑' : '↓'} {change.text}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : query.trim() ? (
            <div className="p-4 text-center text-muted-foreground">
              No cryptocurrencies found
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};
