import { apiClient, clearAccessToken, setAccessToken } from './api';

export const AuthService = {
  async register(data: { username: string; email: string; password: string; skills?: string[] }) {
    const response = await apiClient.post('/auth/signup', data);
    setAccessToken(response.data.data.accessToken);
    return response.data.data;
  },
  async login(data: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', data);
    setAccessToken(response.data.data.accessToken);
    return response.data.data;
  },
  async me() {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },
  async logout() {
    await apiClient.post('/auth/logout');
    clearAccessToken();
  },
};
