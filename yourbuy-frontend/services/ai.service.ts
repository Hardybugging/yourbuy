import { apiClient } from './api';

export const AiService = {
  async insights() {
    const response = await apiClient.get('/ai/insights');
    return response.data.data;
  },
  async ask(message: string) {
    const response = await apiClient.post('/ai/assistant', { message });
    return response.data.data;
  },
};
