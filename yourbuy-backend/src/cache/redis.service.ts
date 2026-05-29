import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client?: Redis;

  constructor(config: ConfigService) {
    const redisUrl = config.get<string>('redisUrl');
    if (redisUrl) {
      this.client = new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
      this.client.on('error', (error) => this.logger.warn(`Redis unavailable: ${error.message}`));
      this.client.connect().catch((error) => this.logger.warn(`Redis connect skipped: ${error.message}`));
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    if (!this.client) return;
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }
}