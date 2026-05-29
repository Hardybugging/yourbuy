import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NewsApiProvider {
  constructor(private readonly config: ConfigService) {}

  async marketNews(query = 'stocks') {
    const apiKey = this.config.get<string>('providers.newsApiKey');
    if (!apiKey) return [];
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: { q: query, language: 'en', pageSize: 5, apiKey },
      timeout: 5000,
    });
    return response.data?.articles ?? [];
  }
}