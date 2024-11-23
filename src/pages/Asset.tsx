import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAssets } from '@/lib/api';
import { formatPrice, formatMarketCap, formatPercentage } from '@/lib/utils';
import AssetMarkets from '@/components/AssetMarkets';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WatchlistButton from '@/components/WatchlistButton';
import { getCoinImageUrl } from '@/lib/api';
import Spinner from '@/components/Spinner';

interface Asset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
}

const Asset = () => {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        const assets = await getAssets();
        const foundAsset = assets.find((a: Asset) => a.id === id);
        if (foundAsset) {
          setAsset(foundAsset);
        } else {
          setError('Asset not found');
        }
      } catch (error) {
        console.error('Error fetching asset:', error);
        setError('Failed to load asset data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAsset();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" className="mb-4" />
        <p className="text-purple-500 font-medium">Loading asset details...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-400 text-lg">{error || 'Asset not found'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Asset Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center">
          <img
            src={getCoinImageUrl(asset.symbol)[0]}
            alt={`${asset.name} logo`}
            className="w-16 h-16 rounded-full mr-4"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const urls = getCoinImageUrl(asset.symbol);
              const currentIndex = urls.indexOf(target.src);
              if (currentIndex < urls.length - 1) {
                target.src = urls[currentIndex + 1];
              } else {
                target.src = '/assets/placeholder-coin.png';
                target.onerror = null;
              }
            }}
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{asset.name}</h1>
              <span className="text-gray-400 text-lg">({asset.symbol})</span>
              <span className="text-gray-400 text-sm">Rank #{asset.rank}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-mono text-white">
                {formatPrice(asset.priceUsd)}
              </span>
              <span className={`text-lg ${parseFloat(asset.changePercent24Hr) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(asset.changePercent24Hr)}
              </span>
            </div>
          </div>
        </div>
        <WatchlistButton assetId={asset.id} />
      </div>

      {/* Asset Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-[#1a1a1a] border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Market Cap</div>
          <div className="text-lg text-white">{formatMarketCap(asset.marketCapUsd)}</div>
        </Card>
        <Card className="p-4 bg-[#1a1a1a] border-gray-700">
          <div className="text-sm text-gray-400 mb-1">24h Volume</div>
          <div className="text-lg text-white">{formatMarketCap(asset.volumeUsd24Hr)}</div>
        </Card>
        <Card className="p-4 bg-[#1a1a1a] border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Circulating Supply</div>
          <div className="text-lg text-white">
            {parseInt(asset.supply).toLocaleString()} {asset.symbol}
          </div>
        </Card>
        <Card className="p-4 bg-[#1a1a1a] border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Max Supply</div>
          <div className="text-lg text-white">
            {asset.maxSupply 
              ? `${parseInt(asset.maxSupply).toLocaleString()} ${asset.symbol}`
              : 'Unlimited'}
          </div>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="markets" className="space-y-4">
        <TabsList className="bg-[#1a1a1a]">
          <TabsTrigger value="markets">Markets</TabsTrigger>
          <TabsTrigger value="chart">Price Chart</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="markets" className="space-y-4">
          <Card className="p-6 bg-[#1a1a1a] border-gray-700">
            <AssetMarkets assetId={asset.id} />
          </Card>
        </TabsContent>

        <TabsContent value="chart">
          <Card className="p-6 bg-[#1a1a1a] border-gray-700">
            <div className="h-[400px] flex items-center justify-center text-gray-400">
              Price chart coming soon...
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="p-6 bg-[#1a1a1a] border-gray-700">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">About {asset.name}</h2>
              <p className="text-gray-400">
                Detailed information about {asset.name} coming soon...
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Asset;
