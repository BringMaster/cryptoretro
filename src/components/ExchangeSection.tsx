import { Card, CardContent } from "@/components/ui/card";
import { Network } from "lucide-react";

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
        Top Exchanges
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
                    <h3 className="font-bold text-lg">{exchange.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Rank #{exchange.rank}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-secondary">
                      ${parseFloat(exchange.volumeUsd).toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {exchange.tradingPairs} pairs
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