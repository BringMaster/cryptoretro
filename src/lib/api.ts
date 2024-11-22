import axios from 'axios';

const BASE_URL = 'https://api.coincap.io/v2';
const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

export const getTopAssets = async () => {
  const response = await axios.get(`${BASE_URL}/assets?limit=50`);
  return response.data.data;
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
  const response = await axios.get(`${BASE_URL}/assets/${id}/markets?limit=5`);
  return response.data.data;
};

export const getAssetNews = async (assetName: string) => {
  try {
    const response = await axios.get(
      `${NEWS_API_URL}?q=${encodeURIComponent(assetName + ' cryptocurrency')}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
    );
    return response.data.articles.slice(0, 5);
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};