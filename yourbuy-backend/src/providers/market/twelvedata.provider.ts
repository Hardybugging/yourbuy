import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TwelveDataProvider {
  constructor(private readonly config: ConfigService) {}

  async quote(symbol: string) {
    const apiKey = this.config.get<string>('providers.twelveDataApiKey');
    if (!apiKey) return null;
    const response = await axios.get('https://api.twelvedata.com/quote', {
      params: { symbol, apikey: apiKey },
      timeout: 5000,
    });
    return response.data;
  }

  async search(query: string) {
    const apiKey = this.config.get<string>('providers.twelveDataApiKey');
    if (!apiKey) return null;
    const response = await axios.get('https://api.twelvedata.com/symbol_search', {
      params: { symbol: query, apikey: apiKey },
      timeout: 5000,
    });
    return response.data;
  }
}