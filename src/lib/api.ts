import axios from 'axios';
import pThrottle from 'p-throttle';
import { cacheService } from './cache';

const COINCAP_API = '/api/coincap';
const CRYPTOCOMPARE_API = 'https://min-api.cryptocompare.com/data/v2';
const CRYPTOCOMPARE_API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
const COINCAP_KEY = import.meta.env.VITE_COINCAP_API_KEY;

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  ASSETS: 30,          // 30 seconds for asset list
  ASSET_HISTORY: 300,  // 5 minutes for historical data
  MARKETS: 60,         // 1 minute for markets data
  NEWS: 300,           // 5 minutes for news
};

// Create an axios instance with default config
const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Create a throttled request function (10 requests per second)
const throttle = pThrottle({
  limit: 10,
  interval: 1000
});

const throttledRequest = throttle(async (config: any) => {
  return await apiClient(config);
});

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getAssets = async () => {
  console.log('Fetching assets from:', `${COINCAP_API}/assets`);
  const cacheKey = 'assets';
  const cachedData = cache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log('Assets response from cache:', cachedData.data);
    return cachedData.data;
  }

  try {
    const response = await throttledRequest({
      method: 'GET',
      url: `${COINCAP_API}/assets`,
      params: {
        limit: 2000 // Increased limit to get more coins
      },
      retry: 3,
      retryDelay: 1000
    });
    
    console.log('Assets response:', response.data);
    const data = response.data.data;
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    console.error('Error in getAssets:', error);
    if (cachedData) return cachedData.data;
    throw error;
  }
};

export const getNews = async (assetSymbol?: string) => {
  console.log('Fetching news for symbol:', assetSymbol);
  const cacheKey = assetSymbol ? `news-${assetSymbol}` : 'general-news';
  const cachedData = cache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log('News response from cache:', cachedData.data);
    return cachedData.data;
  }

  try {
    const response = await throttledRequest({
      method: 'GET',
      url: `${CRYPTOCOMPARE_API}/news/`,
      params: {
        api_key: CRYPTOCOMPARE_API_KEY,
        ...(assetSymbol && { categories: assetSymbol })
      }
    });
    
    console.log('News response:', response.data);
    const data = response.data.Data || [];
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    if (cachedData) return cachedData.data;
    return [];
  }
};

export const getAssetHistory = async (
  assetId: string,
  interval: string = 'd1',
  start?: number,
  end?: number
) => {
  console.log('Fetching history for asset:', assetId);
  const cacheKey = `history-${assetId}-${interval}-${start}-${end}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL.ASSET_HISTORY * 1000) {
    console.log('History response from cache:', cachedData.data);
    return cachedData.data;
  }

  try {
    const response = await throttledRequest({
      method: 'GET',
      url: `${COINCAP_API}/assets/${assetId}/history`,
      params: {
        interval,
        start,
        end
      }
    });
    
    console.log('History response:', response.data);
    const data = response.data.data;
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    console.error('Error fetching asset history:', error);
    if (cachedData) return cachedData.data;
    throw error;
  }
};

export const getAssetMarkets = async (assetId: string) => {
  console.log('Fetching markets for asset:', assetId);
  const cacheKey = `markets_${assetId}`;
  const cachedData = cacheService.get(cacheKey);

  if (cachedData) {
    console.log('Markets response from cache:', cachedData);
    return cachedData;
  }

  try {
    let allMarkets = [];

    // Fetch from CoinCap
    try {
      const coincapResponse = await throttledRequest({
        method: 'GET',
        url: `${COINCAP_API}/assets/${assetId}/markets`,
        params: {
          limit: 2000
        }
      });

      if (coincapResponse?.data?.data) {
        const coincapMarkets = coincapResponse.data.data
          .filter((market: any) => market.volumeUsd24Hr && parseFloat(market.volumeUsd24Hr) > 0)
          .map((market: any) => ({
            exchangeId: market.exchangeId,
            baseSymbol: market.baseSymbol,
            quoteSymbol: market.quoteSymbol,
            priceUsd: market.priceUsd,
            volumeUsd24Hr: market.volumeUsd24Hr,
            volumePercent: market.volumePercent,
            source: 'coincap'
          }));
        allMarkets = [...allMarkets, ...coincapMarkets];
      }
    } catch (coincapError) {
      console.error('Error fetching from CoinCap:', coincapError);
    }

    // Map common symbol variations and exchanges
    const symbolMap: { [key: string]: string } = {
      'solana': 'SOL',
      'bitcoin': 'BTC',
      'ethereum': 'ETH'
    };

    const exchangeMap: { [key: string]: string } = {
      'BINANCE': 'Binance',
      'COINBASE': 'Coinbase Exchange',
      'KRAKEN': 'Kraken',
      'BITSTAMP': 'Bitstamp',
      'GEMINI': 'Gemini',
      'KUCOIN': 'KuCoin',
      'BITFINEX': 'Bitfinex',
      'OKX': 'OKX',
      'HUOBI': 'Huobi',
      'GATEIO': 'Gate.io'
    };

    const symbol = symbolMap[assetId.toLowerCase()] || assetId.toUpperCase();

    // Fetch from CryptoCompare
    try {
      // Fetch markets for different quote currencies
      const quoteSymbols = ['USD', 'USDT', 'BUSD', 'USDC'];
      const marketPromises = quoteSymbols.map(quote => 
        throttledRequest({
          method: 'GET',
          url: `${CRYPTOCOMPARE_API}/top/exchanges/full`,
          params: {
            fsym: symbol,
            tsym: quote,
            limit: 100,
            api_key: CRYPTOCOMPARE_API_KEY
          }
        })
      );

      const responses = await Promise.all(marketPromises);

      responses.forEach((response, index) => {
        const quoteSymbol = quoteSymbols[index];
        if (response?.data?.Data?.Exchanges) {
          const markets = response.data.Data.Exchanges
            .filter((exchange: any) => 
              exchange && 
              exchange.VOLUME24HOUR > 0 && 
              exchange.MARKET in exchangeMap
            )
            .map((exchange: any) => ({
              exchangeId: exchangeMap[exchange.MARKET] || exchange.MARKET,
              baseSymbol: symbol,
              quoteSymbol,
              priceUsd: exchange.PRICE || 0,
              volumeUsd24Hr: (exchange.VOLUME24HOUR * exchange.PRICE).toString(),
              volumePercent: exchange.VOLUME24HOUR > 0 
                ? ((exchange.VOLUME24HOUR / response.data.Data.TotalVolume24H) * 100).toString()
                : '0',
              source: 'cryptocompare'
            }));
          allMarkets = [...allMarkets, ...markets];
        }
      });
    } catch (cryptoCompareError) {
      console.error('Error fetching from CryptoCompare:', cryptoCompareError);
    }

    // If no markets were found from either source, throw an error
    if (allMarkets.length === 0) {
      throw new Error('No markets found for this asset');
    }

    // Deduplicate and sort markets
    const uniqueMarkets = allMarkets
      .filter((market, index, self) => 
        index === self.findIndex(m => 
          m.exchangeId === market.exchangeId && 
          m.baseSymbol === market.baseSymbol && 
          m.quoteSymbol === market.quoteSymbol
        )
      )
      .sort((a, b) => parseFloat(b.volumeUsd24Hr) - parseFloat(a.volumeUsd24Hr));

    console.log('Combined markets response:', uniqueMarkets);
    cacheService.set(cacheKey, uniqueMarkets, CACHE_TTL.MARKETS);
    return uniqueMarkets;
  } catch (error) {
    console.error('Error fetching asset markets:', error);
    throw error;
  }
};

export const getCoinImageUrl = (symbol: string): string[] => {
  return [
    `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`,
    `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`,
    `https://www.cryptocompare.com/media/37746251/${symbol.toLowerCase()}.png`,
    `https://s2.coinmarketcap.com/static/img/coins/64x64/${symbol.toLowerCase()}.png`
  ];
}