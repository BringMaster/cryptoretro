/**
 * Get the trading pair URL for a specific exchange
 */
export const getExchangeUrl = (exchangeId: string, baseSymbol: string, quoteSymbol: string): string => {
  // Normalize exchange ID and symbols
  const exchange = exchangeId.toLowerCase();
  const base = baseSymbol.toUpperCase();
  const quote = quoteSymbol.toUpperCase();

  // Exchange-specific URL formats
  switch (exchange) {
    case 'binance':
      return `https://www.binance.com/en/trade/${base}_${quote}`;
    case 'binance us':
    case 'binanceus':
      return `https://www.binance.us/trade/${base}_${quote}`;
    case 'coinbase exchange':
    case 'coinbase':
      return `https://pro.coinbase.com/trade/${base}-${quote}`;
    case 'kraken':
      return `https://trade.kraken.com/markets/kraken/${base}/${quote}`;
    case 'bitstamp':
      return `https://www.bitstamp.net/markets/${base.toLowerCase()}/${quote.toLowerCase()}/trading/`;
    case 'gemini':
      return `https://exchange.gemini.com/trade/${base}${quote}`;
    case 'kucoin':
      return `https://trade.kucoin.com/${base}-${quote}`;
    case 'bitfinex':
      return `https://trading.bitfinex.com/t/${base}:${quote}`;
    case 'okx':
      return `https://www.okx.com/trade-spot/${base.toLowerCase()}-${quote.toLowerCase()}`;
    case 'huobi':
      return `https://www.huobi.com/en-us/exchange/${base.toLowerCase()}_${quote.toLowerCase()}`;
    case 'gate.io':
    case 'gate':
      return `https://www.gate.io/trade/${base}_${quote}`;
    case 'bybit':
      return `https://www.bybit.com/trade/${quote}/${base}${quote}`;
    case 'mexc':
    case 'mexc global':
      return `https://www.mexc.com/exchange/${base}_${quote}`;
    case 'bitget':
      return `https://www.bitget.com/spot/${base}${quote}_SPBL`;
    case 'htx':
      return `https://www.htx.com/en-us/trade/${base.toLowerCase()}_${quote.toLowerCase()}`;
    case 'bingx':
      return `https://bingx.com/en-us/spot/${base.toLowerCase()}-${quote.toLowerCase()}`;
    case 'bitmart':
      return `https://www.bitmart.com/trade/en?symbol=${base}_${quote}`;
    case 'cryptocom':
    case 'crypto.com':
      return `https://crypto.com/exchange/trade/${base}_${quote}`;
    default:
      return '';
  }
};
