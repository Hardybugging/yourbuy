import { apiClient } from './api';

export const AnalyticsService = {
  async portfolio() {
    const response = await apiClient.get('/analytics/portfolio');
    return response.data.data;
  },
};
