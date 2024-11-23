import { useEffect, useState } from 'react';
import { getAssetMarkets } from '@/lib/api';
import { getExchangeUrl } from '@/lib/exchange-urls';
import { ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Market {
  exchangeId: string;
  baseSymbol: string;
  quoteSymbol: string;
  priceUsd: string;
  volumeUsd24Hr: string;
  volumePercent: string;
  source?: string;
}

interface AssetMarketsProps {
  assetId: string;
}

const formatPrice = (price: string) => {
  const numPrice = parseFloat(price);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: numPrice > 1e9 ? 'compact' : 'standard'
  }).format(numPrice);
};

const formatVolume = (volume: string) => {
  const numVolume = parseFloat(volume);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact'
  }).format(numVolume);
};

const formatPercent = (percent: string) => {
  const num = parseFloat(percent);
  return `${num.toFixed(2)}%`;
};

const AssetMarkets = ({ assetId }: AssetMarketsProps) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true);
      try {
        const data = await getAssetMarkets(assetId);
        setMarkets(data as Market[]);
      } catch (error) {
        console.error('Error fetching markets:', error);
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [assetId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-pulse text-purple-500">Loading markets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No market data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Exchange</TableHead>
            <TableHead className="text-left">Pair</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Volume (24h)</TableHead>
            <TableHead className="text-right">Market Share</TableHead>
            <TableHead className="text-right">Trade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {markets.map((market) => (
            <TableRow key={`${market.exchangeId}-${market.baseSymbol}-${market.quoteSymbol}`}>
              <TableCell className="font-medium">{market.exchangeId}</TableCell>
              <TableCell>{market.baseSymbol}/{market.quoteSymbol}</TableCell>
              <TableCell className="text-right font-mono">
                {formatPrice(market.priceUsd)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatVolume(market.volumeUsd24Hr)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatPercent(market.volumePercent)}
              </TableCell>
              <TableCell className="text-right">
                <a
                  href={getExchangeUrl(market.exchangeId, market.baseSymbol, market.quoteSymbol)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Trade
                  <ExternalLink className="ml-1 w-4 h-4" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AssetMarkets;