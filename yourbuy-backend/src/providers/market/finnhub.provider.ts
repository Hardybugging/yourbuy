import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FinnhubProvider {
  constructor(private readonly config: ConfigService) {}

  async quote(symbol: string) {
    const apiKey = this.config.get<string>('providers.finnhubApiKey');
    if (!apiKey) return null;
    const response = await axios.get('https://finnhub.io/api/v1/quote', {
      params: { symbol, token: apiKey },
      timeout: 5000,
    });
    return response.data;
  }
}