import axios from 'axios';
import pThrottle from 'p-throttle';
import { cacheService } from './cache';

const COINCAP_API = '/api/coincap';
const CRYPTOCOMPARE_API = 'https://min-api.cryptocompare.com/data';
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

// Add base URL for production
if (process.env.NODE_ENV === 'production') {
  apiClient.defaults.baseURL = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'https://cryptoretro.vercel.app';
}

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

export interface NewsParams {
  page?: number;
  limit?: number;
  categories?: string;
  assetSymbol?: string;
}

// News API endpoints
const NEWS_APIS = {
  CRYPTOCOMPARE: `${CRYPTOCOMPARE_API}/v2/news/`,
  CRYPTOPANIC: 'https://cryptopanic.com/api/v1/posts',
  COINPAPRIKA: 'https://api.coinpaprika.com/v1/news'
};

interface NewsSource {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

// Standardized news article interface
export interface NewsArticle {
  id: string;
  title: string;
  body: string;
  url: string;
  published_on: number;
  source: NewsSource;
  imageurl?: string;
  categories?: string[];
  tags?: string[];
}

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

export const getNews = async ({ page = 1, limit = 15, categories, assetSymbol }: NewsParams = {}) => {
  try {
    // Just use CryptoCompare for now since it's more reliable
    const news = await getCryptoCompareNews({ 
      page, 
      limit: Math.max(50, limit * 2), // Get more news to ensure we have enough
      categories 
    });

    // Only filter if we have an asset symbol
    const filteredNews = assetSymbol ? filterNewsByAsset(news, assetSymbol) : news;

    // Sort and limit results
    return sortNewsByDate(filteredNews).slice(0, limit);
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

const getCryptoCompareNews = async ({ page, limit, categories }: NewsParams) => {
  try {
    const params = {
      api_key: CRYPTOCOMPARE_API_KEY,
      lang: 'EN',
      feeds: 'cryptocompare,cointelegraph,coindesk', // Start with the core feeds
      sortOrder: 'latest',
      extraParams: 'CryptoRetro',
      page: Math.max(0, page - 1),
      limit: limit || 20
    };

    console.log('Fetching news with params:', {
      ...params,
      api_key: '***' // Hide API key in logs
    });

    const response = await apiClient.get(NEWS_APIS.CRYPTOCOMPARE, { params });
    
    console.log('CryptoCompare response:', {
      status: response.status,
      hasData: !!response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataKeys: Object.keys(response.data || {}),
      Message: response.data?.Message,
      Type: response.data?.Type,
      sample: response.data?.Data?.[0]
    });

    // Ensure we have valid data
    if (!response.data?.Data || !Array.isArray(response.data.Data)) {
      console.warn('Invalid or empty response:', response.data?.Message || 'No data');
      return [];
    }

    return response.data.Data.map((article: any) => {
      // Extract source name from the URL or source info
      let sourceName = article.source_info?.name || '';
      const url = article.url?.toLowerCase() || '';
      
      if (url.includes('cointelegraph.com')) {
        sourceName = 'CoinTelegraph';
      } else if (url.includes('coindesk.com')) {
        sourceName = 'CoinDesk';
      } else if (sourceName.toLowerCase().includes('cryptocompare')) {
        sourceName = 'CryptoCompare';
      }

      return {
        id: article.id?.toString() || String(Math.random()),
        title: article.title || '',
        body: article.body || '',
        url: article.url || '',
        published_on: article.published_on || Math.floor(Date.now() / 1000),
        source: {
          id: sourceName.toLowerCase().replace(/\s+/g, ''),
          name: sourceName,
          url: article.source_info?.url || '',
          icon: article.source_info?.img || ''
        },
        imageurl: article.imageurl || '',
        categories: (article.categories || '').split('|').filter(Boolean),
        tags: (article.tags || '').split('|').filter(Boolean)
      };
    });

  } catch (error) {
    console.error('Error fetching CryptoCompare news:', error);
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    return [];
  }
};

const filterNewsByAsset = (news: NewsArticle[], assetSymbol?: string): NewsArticle[] => {
  // If no asset symbol or no news, return as is
  if (!assetSymbol || !news?.length) {
    return news || [];
  }

  const searchTerms = [
    assetSymbol.toLowerCase(),
    assetSymbol.toUpperCase(),
    `$${assetSymbol.toUpperCase()}`, // Common format in news: $BTC
    `#${assetSymbol.toUpperCase()}`, // Common format in news: #BTC
  ];

  // Filter articles that mention the asset in title, body, or categories
  return news.filter(article => {
    if (!article) return false;

    const titleMatch = searchTerms.some(term => 
      article.title?.includes(term)
    );

    const bodyMatch = searchTerms.some(term => 
      article.body?.includes(term)
    );

    const categoryMatch = article.categories?.some(category =>
      searchTerms.some(term => category?.includes(term))
    );

    return titleMatch || bodyMatch || categoryMatch;
  });
};

const sortNewsByDate = (news: NewsArticle[]): NewsArticle[] => {
  return [...news].sort((a, b) => b.published_on - a.published_on);
};

export const getNewsCategories = async () => {
  const cacheKey = 'news:categories';
  const cachedData = await cacheService.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await apiClient.get(`${CRYPTOCOMPARE_API}/news/categories`, {
      params: {
        api_key: CRYPTOCOMPARE_API_KEY
      }
    });
    
    // Ensure we're returning an array and transform the data structure
    const categoriesData = response.data.Data || {};
    const categories = Object.entries(categoriesData).map(([categoryName, count]) => ({
      categoryName,
      wordsAssociatedCount: count
    }));
    
    await cacheService.set(cacheKey, categories, CACHE_TTL.NEWS);
    return categories;
  } catch (error) {
    console.error('Error fetching news categories:', error);
    return []; // Return empty array on error
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
  const cachedData = await cacheService.get(cacheKey);

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