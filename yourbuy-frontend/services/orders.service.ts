import { apiClient } from './api';

export const OrdersService = {
  async execute(data: { symbol: string; quantity: number; side: 'BUY' | 'SELL' }) {
    const response = await apiClient.post('/orders/execute', data);
    return response.data.data;
  },
  async history() {
    const response = await apiClient.get('/orders/history');
    return response.data.data;
  },
};
