import { Link } from 'react-router-dom';
import { Microchip, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

interface AssetCardProps {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  supply: string;
}

const AssetCard = ({ 
  id, 
  rank, 
  symbol, 
  name, 
  priceUsd, 
  changePercent24Hr,
  marketCapUsd,
  volumeUsd24Hr,
  supply
}: AssetCardProps) => {
  const price = parseFloat(priceUsd).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  const change = parseFloat(changePercent24Hr);
  const changeFormatted = Math.abs(change).toFixed(2) + '%';

  const marketCap = parseFloat(marketCapUsd).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const volume = parseFloat(volumeUsd24Hr).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const supplyFormatted = parseFloat(supply).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  });

  return (
    <Link to={`/asset/${id}`}>
      <div className="cyberpunk-card p-6 cursor-pointer group">
        <div className="flex gap-6">
          <div className="w-1/3 border-r border-secondary/30 pr-4 space-y-4">
            <div className="flex items-center gap-2">
              <Microchip className="w-5 h-5 text-secondary group-hover:animate-pulse" />
              <span className="text-xl font-bold">#{rank}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-secondary" />
              <span className="text-sm text-muted-foreground">Market Cap</span>
            </div>
            <div className="text-sm font-mono text-secondary">{marketCap}</div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-secondary" />
              <span className="text-sm text-muted-foreground">Volume 24h</span>
            </div>
            <div className="text-sm font-mono text-secondary">{volume}</div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <span className="text-sm text-muted-foreground">Supply</span>
            </div>
            <div className="text-sm font-mono text-secondary">{supplyFormatted}</div>
          </div>
          
          <div className="w-2/3">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold truncate">{name}</h3>
              <span className="text-2xl font-bold text-accent">{symbol}</span>
            </div>
            <div className="text-right mt-auto">
              <p className="text-xl font-mono mb-2 text-secondary">{price}</p>
              <p className={change >= 0 ? 'price-up' : 'price-down'}>
                {change >= 0 ? '↑' : '↓'} {changeFormatted}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AssetCard;