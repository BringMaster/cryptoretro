import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Asset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
}

interface AssetTableProps {
  assets: Asset[];
}

export const AssetTable = ({ assets }: AssetTableProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
      notation: numPrice < 0.01 ? "scientific" : "standard",
    }).format(numPrice);
  };

  const formatLargeNumber = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    return formatPrice(value);
  };

  const formatChange = (change: string) => {
    const numChange = parseFloat(change);
    return {
      text: `${Math.abs(numChange).toFixed(2)}%`,
      isPositive: numChange >= 0,
    };
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">24h Change</TableHead>
            <TableHead className="text-right hidden md:table-cell">Market Cap</TableHead>
            <TableHead className="text-right hidden md:table-cell">Volume (24h)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const change = formatChange(asset.changePercent24Hr);
            return (
              <TableRow
                key={asset.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/asset/${asset.id}`)}
              >
                <TableCell className="font-medium">{asset.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`}
                      alt={asset.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        // Fallback to CryptoCompare if CoinCap image fails
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.src = `https://www.cryptocompare.com/media/37746251/${asset.symbol.toLowerCase()}.png`;
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{asset.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {asset.symbol}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatPrice(asset.priceUsd)}
                </TableCell>
                <TableCell
                  className={`text-right flex items-center justify-end gap-1 ${
                    change.isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {change.isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {change.text}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  {formatLargeNumber(asset.marketCapUsd)}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  {formatLargeNumber(asset.volumeUsd24Hr)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
