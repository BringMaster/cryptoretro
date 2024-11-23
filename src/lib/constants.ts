// Only include major exchanges with verified working URLs
export const SUPPORTED_EXCHANGES = [
  'Binance',
  'Binance US',
  'Coinbase Exchange',
  'Kraken',
  'Bitstamp',
  'Gemini',
  'KuCoin',
  'Bitfinex',
  'OKX',
  'Huobi',
  'Gate.io'
] as const;

// USD-related quote symbols to include
export const USD_QUOTES = ['USD', 'USDT', 'USDC', 'BUSD', 'DAI'] as const;
