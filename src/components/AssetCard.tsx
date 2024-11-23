import { Link } from 'react-router-dom';
import { Microchip } from 'lucide-react';

interface AssetCardProps {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
}

const AssetCard = ({ id, rank, symbol, name, priceUsd, changePercent24Hr }: AssetCardProps) => {
  const price = parseFloat(priceUsd).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  const change = parseFloat(changePercent24Hr);
  const changeFormatted = Math.abs(change).toFixed(2) + '%';

  return (
    <Link to={`/asset/${id}`}>
      <div className="cyberpunk-card p-6 cursor-pointer group">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xl font-bold flex items-center gap-2">
            <Microchip className="w-5 h-5 text-secondary group-hover:animate-pulse" />
            #{rank}
          </span>
          <span className="text-2xl font-bold text-accent">{symbol}</span>
        </div>
        <h3 className="text-xl mb-4 font-bold truncate">{name}</h3>
        <div className="text-right">
          <p className="text-xl font-mono mb-2 text-secondary">{price}</p>
          <p className={change >= 0 ? 'price-up' : 'price-down'}>
            {change >= 0 ? '↑' : '↓'} {changeFormatted}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default AssetCard;