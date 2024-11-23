import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getTopAssets, getCryptoNews, getExchanges } from '@/lib/api';
import AssetCard from '@/components/AssetCard';
import { Input } from '@/components/ui/input';
import { CircuitBoard, Search, Signal } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import NewsSection from '@/components/NewsSection';
import ExchangeSection from '@/components/ExchangeSection';

const Index = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: assetsData, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets', page, search],
    queryFn: () => getTopAssets(page, search),
  });

  const { data: news } = useQuery({
    queryKey: ['news'],
    queryFn: getCryptoNews,
  });

  const { data: exchanges } = useQuery({
    queryKey: ['exchanges'],
    queryFn: getExchanges,
  });

  const assets = assetsData?.data || [];
  const totalPages = Math.ceil((assetsData?.info?.total || 0) / 20);

  if (isLoadingAssets) {
    return (
      <div className="container mx-auto p-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="cyberpunk-card h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 min-h-screen cyberpunk-grid">
      <div className="flex flex-col gap-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold flex items-center justify-center gap-4">
            <CircuitBoard className="w-12 h-12 text-secondary" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-primary to-accent">
              CryptoRetro
            </span>
            <Signal className="w-12 h-12 text-secondary" />
          </h1>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cyberpunk-input pl-10"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {assets.map((asset: any) => (
            <AssetCard key={asset.id} {...asset} />
          ))}
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {[...Array(Math.min(5, totalPages))].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setPage(i + 1)}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <NewsSection news={news || []} />
          <ExchangeSection exchanges={exchanges || []} />
        </div>
      </div>
    </div>
  );
};

export default Index;