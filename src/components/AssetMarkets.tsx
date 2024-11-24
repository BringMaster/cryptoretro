import React, { useEffect, useState } from 'react';
import { getAssetMarkets } from '@/lib/api';
import { formatPrice, formatMarketCap, formatPercentage } from '@/lib/utils';
import Spinner from '@/components/Spinner';
import { ExternalLink } from 'lucide-react';

interface Market {
  exchangeId: string;
  baseId: string;
  quoteId: string;
  baseSymbol: string;
  quoteSymbol: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  volumePercent: string;
  exchangeUrl?: string;
}

interface AssetMarketsProps {
  assetId: string;
}

const getExchangeUrl = (exchangeId: string, baseSymbol: string, quoteSymbol: string): string => {
  // Normalize inputs
  const exchange = exchangeId.toLowerCase().replace(/\s+/g, '');
  const base = baseSymbol.toUpperCase();
  const quote = quoteSymbol.toUpperCase();

  // Common exchange URL patterns
  const patterns: { [key: string]: string } = {
    'binance': `https://www.binance.com/en/trade/${base}_${quote}`,
    'binanceus': `https://www.binance.us/trade/${base}_${quote}`,
    'coinbasepro': `https://pro.coinbase.com/trade/${base}-${quote}`,
    'coinbaseexchange': `https://pro.coinbase.com/trade/${base}-${quote}`,
    'kraken': `https://trade.kraken.com/markets/kraken/${base}/${quote}`,
    'kucoin': `https://trade.kucoin.com/${base}-${quote}`,
    'huobi': `https://www.huobi.com/en-us/exchange/${base.toLowerCase()}_${quote.toLowerCase()}`,
    'gateio': `https://www.gate.io/trade/${base}_${quote}`,
    'gate': `https://www.gate.io/trade/${base}_${quote}`,
    'bitfinex': `https://trading.bitfinex.com/t/${base}:${quote}`,
    'gemini': `https://exchange.gemini.com/trade/${base}${quote}`,
    'bitstamp': `https://www.bitstamp.net/markets/${base.toLowerCase()}/${quote.toLowerCase()}/trading/`,
    'okx': `https://www.okx.com/trade-spot/${base.toLowerCase()}-${quote.toLowerCase()}`,
    'bybit': `https://www.bybit.com/trade/spot/${base}/${quote}`,
    'mexc': `https://www.mexc.com/exchange/${base}_${quote}`,
    'mexcglobal': `https://www.mexc.com/exchange/${base}_${quote}`,
    'bitget': `https://www.bitget.com/spot/${base}${quote}_SPBL`,
    'htx': `https://www.htx.com/en-us/trade/${base.toLowerCase()}_${quote.toLowerCase()}`,
    'bitmart': `https://www.bitmart.com/trade/en?symbol=${base}_${quote}`,
    'bingx': `https://bingx.com/en-us/spot/${base.toLowerCase()}-${quote.toLowerCase()}`,
    'phemex': `https://phemex.com/spot/trade/${base}${quote}`,
    'bitrue': `https://www.bitrue.com/trade/${base.toLowerCase()}_${quote.toLowerCase()}`,
    'poloniex': `https://poloniex.com/trade/${base}_${quote}`,
    'lbank': `https://www.lbank.info/exchange/${base.toLowerCase()}/${quote.toLowerCase()}`,
    'digifinex': `https://www.digifinex.com/en-ww/trade/${base}_${quote}`,
    'whitebit': `https://whitebit.com/trade/${base}_${quote}`,
    'bigone': `https://big.one/trade/${base}-${quote}`,
    'cryptocomexchange': `https://exchange.crypto.com/trade/spot/${base}_${quote}`,
    'crypto.comexchange': `https://exchange.crypto.com/trade/spot/${base}_${quote}`,
    'ascendex(bitmax)': `https://ascendex.com/en/cashtrade-spottrading/${base}-${quote}`,
    'ascendexbitmax': `https://ascendex.com/en/cashtrade-spottrading/${base}-${quote}`
  };

  return patterns[exchange] || '';
};

const AssetMarkets: React.FC<AssetMarketsProps> = ({ assetId }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const data: Market[] = await getAssetMarkets(assetId);
        
        // Add exchange URLs and sort by volume, limit to top 10 markets
        const marketsWithUrls: Market[] = data
          .map((market: Market) => ({
            ...market,
            exchangeUrl: getExchangeUrl(
              market.exchangeId,
              market.baseSymbol,
              market.quoteSymbol
            )
          }))
          .sort((a, b) => parseFloat(b.volumeUsd24Hr) - parseFloat(a.volumeUsd24Hr))
          .slice(0, 10); // Limit to top 10 markets by volume

        setMarkets(marketsWithUrls);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [assetId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <Spinner size="md" className="mb-2" />
        <p className="text-purple-500 font-medium">Loading markets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-4">
        <p>{error}</p>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="text-gray-400 text-center py-4">
        <p>No market data available for this asset.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-[#1a1a1a]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Exchange
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Pair
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Volume (24h)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Volume %
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
              Trade
            </th>
          </tr>
        </thead>
        <tbody className="bg-[#0a0a0a] divide-y divide-gray-700">
          {markets.map((market, index) => (
            <tr 
              key={`${market.exchangeId}-${market.baseSymbol}-${market.quoteSymbol}-${index}`}
              className="hover:bg-[#1a1a1a] transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                  <span>{market.exchangeId}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm">
                  <span className="text-white">{market.baseSymbol}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-400">{market.quoteSymbol}</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-100 font-mono">
                  {formatPrice(market.priceUsd)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-100">
                  {formatMarketCap(market.volumeUsd24Hr)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-100">
                  {parseFloat(market.volumePercent).toFixed(2)}%
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                {market.exchangeUrl && (
                  <a
                    href={market.exchangeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <span className="mr-1">Trade</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetMarkets;