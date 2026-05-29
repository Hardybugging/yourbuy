import { apiClient } from './api';

export const PortfolioService = {
  async overview() {
    const response = await apiClient.get('/portfolio/overview');
    return response.data.data;
  },
  async performance() {
    const response = await apiClient.get('/portfolio/performance');
    return response.data.data;
  },
  async allocation() {
    const response = await apiClient.get('/portfolio/allocation');
    return response.data.data;
  },
};
