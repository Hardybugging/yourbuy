import { Injectable } from '@nestjs/common';

@Injectable()
export class GroqProvider {
  async complete(): Promise<null> {
    return null;
  }
}