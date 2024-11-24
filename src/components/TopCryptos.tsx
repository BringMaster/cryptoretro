import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssets } from '@/lib/api';
import { formatPrice, formatPercentage } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Asset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
}

const TopCryptos = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopAssets = async () => {
      try {
        const data = await getAssets({ limit: 10 });
        setAssets(data.slice(0, 10)); // Ensure we only take the first 10 assets
      } catch (error) {
        console.error('Error fetching top assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopAssets();
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Top 10 Cryptocurrencies</h2>
      <div className="space-y-4">
        {assets.map((asset) => (
          <Link
            key={asset.id}
            to={`/asset/${asset.id}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-gray-500 text-sm">#{asset.rank}</span>
              <div>
                <span className="font-medium">{asset.name}</span>
                <span className="text-gray-400 text-sm ml-1.5">{asset.symbol}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatPrice(asset.priceUsd)}</div>
              <div className={`text-sm flex items-center justify-end ${
                parseFloat(asset.changePercent24Hr) >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {parseFloat(asset.changePercent24Hr) >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {formatPercentage(asset.changePercent24Hr)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default TopCryptos;
