import axios from 'axios';

const BASE_URL = 'https://api.coincap.io/v2';
const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const ITEMS_PER_PAGE = 20;

export const getTopAssets = async (
  page: number = 1,
  search: string = '',
  sortBy: string = 'rank'
) => {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const response = await axios.get(
    `${BASE_URL}/assets?limit=${ITEMS_PER_PAGE}&offset=${offset}&search=${search}`
  );
  return response.data;
};

export const getAssetHistory = async (id: string, interval: string = 'd1') => {
  const response = await axios.get(`${BASE_URL}/assets/${id}/history?interval=${interval}`);
  return response.data.data;
};

export const getAssetDetails = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/assets/${id}`);
  return response.data.data;
};

export const getAssetMarkets = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/assets/${id}/markets?limit=10`);
  return response.data.data;
};

export const getCryptoNews = async () => {
  if (!NEWS_API_KEY) {
    console.error('News API key is not configured');
    return [];
  }

  try {
    const response = await axios.get(
      `${NEWS_API_URL}?q=cryptocurrency&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
    );
    return response.data.articles.slice(0, 6);
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

export const getExchanges = async () => {
  const response = await axios.get(`${BASE_URL}/exchanges?limit=10`);
  return response.data.data;
};