import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAssetDetails, getAssetHistory, getAssetMarkets } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AssetMarkets from '@/components/asset/AssetMarkets';

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

  if (isLoadingAsset || isLoadingHistory) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 w-1/3 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-8 rounded-lg border-2 border-red-200">
          <h1 className="text-2xl font-bold mb-4">Asset Not Found</h1>
          <Link to="/" className="text-blue-500 hover:underline">
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
      <Link to="/" className="inline-flex items-center mb-6 text-gray-600 hover:text-gray-900">
        <span className="mr-2">←</span> Back to Home
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-6 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{asset.name}</h1>
            <p className="text-xl text-gray-600">{asset.symbol}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono mb-2">{price}</p>
            <p className={`text-lg ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '↑' : '↓'} {changeFormatted}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            {intervals.map((interval) => (
              <button
                key={interval.value}
                onClick={() => setSelectedInterval(interval)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedInterval.value === interval.value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
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
          <h2 className="text-2xl font-bold mb-4">Trading Markets</h2>
          <AssetMarkets
            markets={markets || []}
            isLoading={isLoadingMarkets}
            assetName={asset.name}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;