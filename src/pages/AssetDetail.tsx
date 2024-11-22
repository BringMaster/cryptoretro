import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAssetDetails, getAssetHistory, getAssetNews, getAssetMarkets } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import AssetMarkets from '@/components/asset/AssetMarkets';
import AssetNews from '@/components/asset/AssetNews';

const intervals = [
  { label: '24H', value: 'h1' },
  { label: '7D', value: 'd1' },
  { label: '30D', value: 'd1' },
];

const AssetDetail = () => {
  const { id } = useParams();
  const [selectedInterval, setSelectedInterval] = useState(intervals[0]);

  const { data: asset, isLoading: isLoadingAsset } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => getAssetDetails(id!),
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['history', id, selectedInterval.value],
    queryFn: () => getAssetHistory(id!, selectedInterval.value),
  });

  const { data: markets, isLoading: isLoadingMarkets } = useQuery({
    queryKey: ['markets', id],
    queryFn: () => getAssetMarkets(id!),
  });

  const { data: news, isLoading: isLoadingNews } = useQuery({
    queryKey: ['news', asset?.name],
    queryFn: () => getAssetNews(asset?.name || ''),
    enabled: !!asset?.name,
  });

  if (isLoadingAsset || isLoadingHistory) {
    return (
      <div className="container mx-auto p-6">
        <div className="brutalist-card p-8 animate-pulse">
          <div className="h-8 bg-gray-200 mb-4 w-1/3" />
          <div className="h-16 bg-gray-200 mb-8" />
          <div className="h-64 bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto p-6">
        <div className="brutalist-card p-8 bg-red-50">
          <h1 className="text-4xl font-bold mb-4">Asset Not Found</h1>
          <Link to="/" className="brutalist-button inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const price = parseFloat(asset.priceUsd).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const change = parseFloat(asset.changePercent24Hr);
  const changeFormatted = Math.abs(change).toFixed(2) + '%';

  return (
    <div className="container mx-auto p-6">
      <Link to="/" className="brutalist-button inline-block mb-6">
        ← Back
      </Link>
      
      <div className="brutalist-card p-8 mb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{asset.name}</h1>
            <p className="text-2xl">{asset.symbol}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-mono mb-2">{price}</p>
            <p className={`text-xl ${change >= 0 ? 'price-up' : 'price-down'}`}>
              {change >= 0 ? '↑' : '↓'} {changeFormatted}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="brutalist-card p-4">
            <p className="text-sm mb-1">Market Cap</p>
            <p className="text-xl font-mono">
              ${parseFloat(asset.marketCapUsd).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="brutalist-card p-4">
            <p className="text-sm mb-1">Volume (24Hr)</p>
            <p className="text-xl font-mono">
              ${parseFloat(asset.volumeUsd24Hr).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="brutalist-card p-4">
            <p className="text-sm mb-1">Supply</p>
            <p className="text-xl font-mono">
              {parseFloat(asset.supply).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            {intervals.map((interval) => (
              <button
                key={interval.value}
                onClick={() => setSelectedInterval(interval)}
                className={`brutalist-button ${
                  selectedInterval.value === interval.value ? 'bg-black text-white' : ''
                }`}
              >
                {interval.label}
              </button>
            ))}
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleDateString()}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: any) =>
                    `$${parseFloat(value).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  }
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Line
                  type="monotone"
                  dataKey="priceUsd"
                  stroke="#000000"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">About {asset.name}</h2>
          <p className="text-gray-700">
            {asset.name} ({asset.symbol}) is a cryptocurrency with a current market cap of ${parseFloat(asset.marketCapUsd).toLocaleString('en-US', { maximumFractionDigits: 0 })}. 
            It has a circulating supply of {parseFloat(asset.supply).toLocaleString('en-US', { maximumFractionDigits: 0 })} {asset.symbol} 
            and a 24-hour trading volume of ${parseFloat(asset.volumeUsd24Hr).toLocaleString('en-US', { maximumFractionDigits: 0 })}.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Where to Trade {asset.name}</h2>
          <AssetMarkets
            markets={markets || []}
            isLoading={isLoadingMarkets}
            assetName={asset.name}
          />
        </div>
      </div>

      <div className="brutalist-card p-8">
        <h2 className="text-3xl font-bold mb-6">Latest News</h2>
        <AssetNews
          news={news || []}
          isLoading={isLoadingNews}
          assetName={asset.name}
        />
      </div>
    </div>
  );
};

export default AssetDetail;