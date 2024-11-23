import { Card, CardContent } from "@/components/ui/card";
import { Network, ExternalLink } from "lucide-react";

interface Exchange {
  exchangeId: string;
  name: string;
  rank: string;
  percentTotalVolume: string;
  volumeUsd: string;
  tradingPairs: string;
  socket: boolean;
  exchangeUrl: string;
  updated: number;
}

interface ExchangeSectionProps {
  exchanges: Exchange[];
}

const ExchangeSection = ({ exchanges }: ExchangeSectionProps) => {
  if (!exchanges.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Network className="w-6 h-6 text-secondary" />
        Trading Markets
      </h2>
      <div className="space-y-4">
        {exchanges.map((exchange) => (
          <a
            key={exchange.exchangeId}
            href={exchange.exchangeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-transform hover:-translate-y-1"
          >
            <Card className="cyberpunk-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {exchange.name}
                      <ExternalLink className="w-4 h-4 text-secondary" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Market Rank #{exchange.rank}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {exchange.tradingPairs} Trading Pairs Available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-secondary">
                      ${parseFloat(exchange.volumeUsd).toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      24h Volume
                    </p>
                    <p className="text-sm text-accent mt-1">
                      {parseFloat(exchange.percentTotalVolume).toFixed(2)}% Market Share
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ExchangeSection;