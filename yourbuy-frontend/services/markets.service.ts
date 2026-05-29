import { apiClient } from './api';

export const MarketsService = {
  async search(q: string) {
    const response = await apiClient.get('/markets/search', { params: { q } });
    return response.data.data;
  },
  async quote(symbol: string) {
    const response = await apiClient.get(`/markets/quotes/${symbol}`);
    return response.data.data;
  },
  async movers() {
    const response = await apiClient.get('/markets/movers');
    return response.data.data;
  },
  async sectors() {
    const response = await apiClient.get('/markets/sectors');
    return response.data.data;
  },
};
