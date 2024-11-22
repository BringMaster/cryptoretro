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
          <div key={i} className="h-16 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {markets?.map((market) => (
        <a
          key={market.exchangeId}
          href={`https://www.${market.exchangeId.toLowerCase()}.com/trade/${market.baseSymbol}-${market.quoteSymbol}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:scale-[1.02] transition-transform"
        >
          <Card className="border-2 border-black">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{market.exchangeId}</h3>
                  <p className="text-sm text-gray-600">
                    Trading Pair: {market.baseSymbol}/{market.quoteSymbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono">
                    ${parseFloat(market.priceUsd).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Volume: ${parseFloat(market.volumeUsd24Hr).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
};

export default AssetMarkets;