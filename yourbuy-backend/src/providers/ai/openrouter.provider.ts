import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OpenRouterProvider {
  constructor(private readonly config: ConfigService) {}

  async complete(prompt: string): Promise<string | null> {
    const apiKey = this.config.get<string>('providers.openRouterApiKey');
    if (!apiKey) return null;
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 15000 },
    );
    return response.data?.choices?.[0]?.message?.content ?? null;
  }
}