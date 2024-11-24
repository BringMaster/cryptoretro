import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { getAssets, getCoinImageUrl } from '@/lib/api';
import { formatPrice, formatMarketCap, formatPercentage } from '@/lib/utils';
import Spinner from '@/components/Spinner';
import { AssetNews } from '@/components/asset/AssetNews';

// Lazy load components
const AdvancedChart = lazy(() => import('@/components/AdvancedChart'));
const AssetMarkets = lazy(() => import('@/components/AssetMarkets'));

// Component loading fallbacks
const ChartLoader = () => (
  <div className="h-[400px] flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

const MarketsLoader = () => (
  <div className="h-[200px] flex items-center justify-center">
    <Spinner size="md" />
  </div>
);

const AssetDetail: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!assetId) return;
      
      try {
        setLoading(true);
        const assets = await getAssets();
        const asset = assets.find(a => a.id === assetId);
        if (!asset) throw new Error('Asset not found');
        setAsset(asset);
      } catch (error: any) {
        console.error('Error fetching asset:', error);
        setError(error.message || 'Failed to load asset data');
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [assetId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size="lg" className="mb-4" />
        <p className="text-purple-500 font-medium">Loading asset details...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-400 text-center">
          <p>Error loading asset details. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Asset Header */}
      <div className="mb-8 bg-[#0a0a0a] rounded-lg p-6 border border-gray-300">
        <div className="flex items-start gap-6">
          {/* Coin Image and Basic Info */}
          <div className="flex items-center gap-4">
            <img
              src={getCoinImageUrl(asset.symbol)[0]}
              alt={asset.name}
              className="w-16 h-16 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const urls = getCoinImageUrl(asset.symbol);
                const currentIndex = urls.indexOf(target.src);
                if (currentIndex < urls.length - 1) {
                  target.src = urls[currentIndex + 1];
                } else {
                  target.src = '/placeholder-coin.png';
                }
              }}
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{asset.name}</h1>
                <span className="text-xl text-gray-400">{asset.symbol}</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-2xl font-mono">{formatPrice(asset.priceUsd)}</p>
                <span className={`text-sm px-2 py-1 rounded ${
                  parseFloat(asset.changePercent24Hr) >= 0 
                    ? 'bg-green-500/10 text-green-400' 
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {formatPercentage(asset.changePercent24Hr)} (24h)
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="flex-1 grid grid-cols-3 gap-6 ml-8 border-l border-gray-400 pl-8">
            <div>
              <p className="text-sm text-gray-400 mb-1">Market Cap</p>
              <p className="text-xl">{formatMarketCap(asset.marketCapUsd)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">24h Volume</p>
              <p className="text-xl">{formatMarketCap(asset.volumeUsd24Hr)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Supply</p>
              <p className="text-xl">{formatMarketCap(asset.supply)} {asset.symbol}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Max Supply</p>
              <p className="text-xl">{asset.maxSupply ? formatMarketCap(asset.maxSupply) : 'Unlimited'} {asset.symbol}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Circulating Supply</p>
              <p className="text-xl">{formatMarketCap(asset.supply)} {asset.symbol}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Supply %</p>
              <p className="text-xl">
                {asset.maxSupply 
                  ? formatPercentage((parseFloat(asset.supply) / parseFloat(asset.maxSupply) * 100).toString())
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and News Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#0a0a0a] rounded-lg p-6 border border-gray-400">
          <h2 className="text-xl font-semibold mb-4">Price Chart</h2>
          <Suspense fallback={<ChartLoader />}>
            <AdvancedChart 
              assetId={assetId || ''} 
              assetName={asset?.name || ''} 
              changePercent24Hr={parseFloat(asset?.changePercent24Hr || '0')} 
            />
          </Suspense>
        </div>

        {/* News */}
        <div className="lg:col-span-1">
          <AssetNews assetSymbol={asset.symbol} />
        </div>
      </div>

      {/* Markets Section */}
      <div className="bg-[#0a0a0a] rounded-lg p-6 border border-gray-400">
        <h2 className="text-xl font-semibold mb-4">Markets</h2>
        <Suspense fallback={<MarketsLoader />}>
          <AssetMarkets assetId={assetId || ''} />
        </Suspense>
      </div>
    </div>
  );
};

export default AssetDetail;