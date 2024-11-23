import { Card, CardContent } from "@/components/ui/card";

interface Market {
  exchangeId: string;
  baseSymbol: string;
  quoteSymbol: string;
  priceUsd: string;
  volumeUsd24Hr: string;
  exchangeUrl: string;
}

interface AssetMarketsProps {
  markets: Market[];
  isLoading: boolean;
  assetName: string;
}

const AssetMarkets = ({ markets, isLoading, assetName }: AssetMarketsProps) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  // Remove duplicate markets by exchangeId
  const uniqueMarkets = markets.reduce((acc: Market[], current) => {
    const exists = acc.find(market => market.exchangeId === current.exchangeId);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      {uniqueMarkets.map((market) => {
        // Generate exchange-specific URLs
        let tradingUrl = market.exchangeUrl;
        if (!tradingUrl) {
          switch (market.exchangeId.toLowerCase()) {
            case 'binance':
              tradingUrl = `https://www.binance.com/en/trade/${market.baseSymbol}_${market.quoteSymbol}`;
              break;
            case 'coinbase':
              tradingUrl = `https://www.coinbase.com/advanced-trade/${market.baseSymbol}-${market.quoteSymbol}`;
              break;
            case 'kraken':
              tradingUrl = `https://trade.kraken.com/charts/${market.baseSymbol}${market.quoteSymbol}`;
              break;
            default:
              tradingUrl = `https://www.${market.exchangeId.toLowerCase()}.com/trade/${market.baseSymbol}-${market.quoteSymbol}`;
          }
        }

        return (
          <a
            key={`${market.exchangeId}-${market.baseSymbol}-${market.quoteSymbol}`}
            href={tradingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-transform hover:scale-[1.02]"
          >
            <Card className="border border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{market.exchangeId}</h3>
                    <p className="text-sm text-muted-foreground">
                      {market.baseSymbol}/{market.quoteSymbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg text-secondary">
                      ${parseFloat(market.priceUsd).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      24h Vol: ${parseFloat(market.volumeUsd24Hr).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        );
      })}
    </div>
  );
};

export default AssetMarkets;