import axios from 'axios';

const BASE_URL = 'https://api.coincap.io/v2';

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