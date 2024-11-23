import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAssetDetails, getAssetHistory, getAssetMarkets } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AssetMarkets from '@/components/asset/AssetMarkets';
import { ArrowLeft, CircuitBoard, Signal } from 'lucide-react';

const intervals = [
  { label: '24H', value: 'h1', days: 1 },
  { label: '7D', value: 'd1', days: 7 },
  { label: '30D', value: 'd1', days: 30 },
];

const AssetDetail = () => {
  const { id } = useParams();
  const [selectedInterval, setSelectedInterval] = useState(intervals[0]);

  const { data: asset, isLoading: isLoadingAsset } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => getAssetDetails(id!),
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['history', id, selectedInterval.value, selectedInterval.days],
    queryFn: () => getAssetHistory(id!, selectedInterval.value),
    select: (data) => {
      // Filter data based on selected interval
      const now = new Date();
      const startDate = new Date(now.getTime() - (selectedInterval.days * 24 * 60 * 60 * 1000));
      return data.filter((item: any) => new Date(item.time) >= startDate);
    }
  });

  const { data: markets, isLoading: isLoadingMarkets } = useQuery({
    queryKey: ['markets', id],
    queryFn: () => getAssetMarkets(id!),
  });

  if (isLoadingAsset || isLoadingHistory) {
    return (
      <div className="container mx-auto p-6 animate-pulse">
        <div className="cyberpunk-card h-96" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto p-6">
        <div className="cyberpunk-card p-8">
          <h1 className="text-2xl font-bold mb-4">Asset Not Found</h1>
          <Link to="/" className="cyberpunk-button">
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
    <div className="container mx-auto p-6 min-h-screen cyberpunk-grid">
      <Link to="/" className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      
      <div className="cyberpunk-card p-6 mb-8">
        <div className="flex justify-between items-start mb-6 border-b border-secondary/30 pb-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold flex items-center gap-4">
              <CircuitBoard className="w-8 h-8 text-secondary" />
              {asset.name}
              <Signal className="w-8 h-8 text-secondary" />
            </h1>
            <p className="text-2xl text-accent">{asset.symbol}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-mono text-secondary mb-2">{price}</p>
            <p className={`text-xl ${change >= 0 ? 'price-up' : 'price-down'}`}>
              {change >= 0 ? '↑' : '↓'} {changeFormatted}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            {intervals.map((interval) => (
              <button
                key={`${interval.value}-${interval.days}`}
                onClick={() => setSelectedInterval(interval)}
                className={`px-4 py-2 transition-all ${
                  selectedInterval.value === interval.value && selectedInterval.days === interval.days
                    ? 'cyberpunk-button'
                    : 'text-muted-foreground hover:text-foreground border-2 border-muted hover:border-secondary'
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
                  tickFormatter={(time) => {
                    const date = new Date(time);
                    return selectedInterval.value === 'h1' 
                      ? date.toLocaleTimeString() 
                      : date.toLocaleDateString();
                  }}
                  stroke="#666"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  stroke="#666"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--secondary))',
                    borderRadius: '4px',
                  }}
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
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Signal className="w-6 h-6 text-secondary" />
            Trading Markets
          </h2>
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