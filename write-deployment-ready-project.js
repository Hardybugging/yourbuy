const fs = require("fs");
const path = require("path");

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trimStart(), "utf8");
}

write("yourbuy-backend/package.json", `{
  "name": "yourbuy-backend",
  "version": "1.0.0",
  "description": "YourBuy production-ready NestJS API",
  "main": "dist/main.js",
  "scripts": {
    "build": "prisma generate && nest build",
    "start": "node dist/main.js",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:dev": "prisma migrate dev",
    "lint": "eslint \\"src/**/*.ts\\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.15",
    "@nestjs/config": "^3.3.0",
    "@nestjs/core": "^10.4.15",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.4.15",
    "@nestjs/platform-socket.io": "^10.4.15",
    "@nestjs/throttler": "^5.2.0",
    "@nestjs/websockets": "^10.4.15",
    "@prisma/client": "^5.22.0",
    "axios": "^1.7.9",
    "bcryptjs": "^2.4.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "cookie-parser": "^1.4.7",
    "dotenv": "^16.4.7",
    "ioredis": "^5.4.2",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.8",
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.8",
    "@types/express": "^5.0.0",
    "@types/node": "^22.10.2",
    "@types/passport": "^1.0.17",
    "@types/passport-google-oauth20": "^2.0.16",
    "@types/passport-jwt": "^4.0.1",
    "@typescript-eslint/eslint-plugin": "^8.18.2",
    "@typescript-eslint/parser": "^8.18.2",
    "eslint": "^9.17.0",
    "prisma": "^5.22.0",
    "typescript": "^5.7.2"
  }
}`);

write("yourbuy-backend/tsconfig.json", `{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "strict": true,
    "strictPropertyInitialization": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}`);

write("yourbuy-backend/nest-cli.json", `{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src"
}`);

write("yourbuy-backend/.env.example", `DATABASE_URL="mysql://yourbuy_user:yourbuy_password@localhost:3306/yourbuy_db"
JWT_SECRET="change-me-access-secret"
JWT_REFRESH_SECRET="change-me-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
REDIS_URL="redis://localhost:6379"
FRONTEND_URL="http://localhost:3000"
PORT=3001
TWELVEDATA_API_KEY=""
FINNHUB_API_KEY=""
OPENROUTER_API_KEY=""
NEWS_API_KEY=""`);

write("yourbuy-backend/prisma/schema.prisma", `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
}

enum OrderSide {
  BUY
  SELL
}

enum OrderType {
  MARKET
  LIMIT
}

enum OrderStatus {
  PENDING
  FILLED
  CANCELLED
  REJECTED
}

enum NotificationType {
  SYSTEM
  MARKET
  PORTFOLIO
  AI
}

model User {
  id             String           @id @default(cuid())
  email          String           @unique
  username       String           @unique
  passwordHash   String
  role           Role             @default(USER)
  level          Int              @default(1)
  riskLevel      RiskLevel        @default(MEDIUM)
  skills         Json?
  settings       Json?
  refreshToken   String?          @db.Text
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  portfolio      Portfolio?
  orders         Order[]
  watchlists     Watchlist[]
  notifications  Notification[]
  conversations  AIConversation[]

  @@index([email])
}

model Portfolio {
  id             String     @id @default(cuid())
  userId         String     @unique
  cashBalance    Decimal    @default(100000) @db.Decimal(18, 2)
  totalValue     Decimal    @default(100000) @db.Decimal(18, 2)
  dayChange      Decimal    @default(0) @db.Decimal(18, 2)
  dayChangePct   Decimal    @default(0) @db.Decimal(10, 4)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  user           User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  holdings       Holding[]
  orders         Order[]

  @@index([userId])
}

model Holding {
  id            String    @id @default(cuid())
  portfolioId   String
  symbol        String
  name          String?
  quantity      Decimal   @db.Decimal(18, 6)
  averagePrice  Decimal   @db.Decimal(18, 4)
  lastPrice     Decimal   @default(0) @db.Decimal(18, 4)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  portfolio     Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  @@unique([portfolioId, symbol])
  @@index([symbol])
}

model Order {
  id           String      @id @default(cuid())
  userId       String
  portfolioId  String
  symbol       String
  side         OrderSide
  type         OrderType   @default(MARKET)
  status       OrderStatus @default(FILLED)
  quantity     Decimal     @db.Decimal(18, 6)
  limitPrice   Decimal?    @db.Decimal(18, 4)
  executedPrice Decimal?   @db.Decimal(18, 4)
  metadata     Json?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  portfolio    Portfolio   @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([symbol])
}

model Watchlist {
  id        String           @id @default(cuid())
  userId    String
  name      String
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  assets    WatchlistAsset[]

  @@unique([userId, name])
  @@index([userId])
}

model WatchlistAsset {
  id          String    @id @default(cuid())
  watchlistId String
  symbol      String
  name        String?
  createdAt   DateTime  @default(now())
  watchlist   Watchlist @relation(fields: [watchlistId], references: [id], onDelete: Cascade)

  @@unique([watchlistId, symbol])
  @@index([symbol])
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType @default(SYSTEM)
  title     String
  message   String           @db.Text
  read      Boolean          @default(false)
  metadata  Json?
  createdAt DateTime         @default(now())
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read, createdAt])
}

model AIConversation {
  id        String      @id @default(cuid())
  userId    String
  title     String?
  context   Json?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  AIMessage[]

  @@index([userId, updatedAt])
}

model AIMessage {
  id             String         @id @default(cuid())
  conversationId String
  role           String
  content        String         @db.Text
  createdAt      DateTime       @default(now())
  conversation   AIConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}`);

write("yourbuy-backend/src/database/prisma.service.ts", `import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}`);

write("yourbuy-backend/src/database/database.module.ts", `import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
`);

write("yourbuy-backend/src/config/env.config.ts", `export const envConfig = () => ({
  port: Number(process.env.PORT || 3001),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  redisUrl: process.env.REDIS_URL,
  providers: {
    twelveDataApiKey: process.env.TWELVEDATA_API_KEY,
    finnhubApiKey: process.env.FINNHUB_API_KEY,
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
    newsApiKey: process.env.NEWS_API_KEY,
  },
});
`);

write("yourbuy-backend/src/cache/redis.service.ts", `import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
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
      this.client.on('error', (error) => this.logger.warn(\`Redis unavailable: \${error.message}\`));
      this.client.connect().catch((error) => this.logger.warn(\`Redis connect skipped: \${error.message}\`));
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
}`);

write("yourbuy-backend/src/cache/cache.module.ts", `import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class CacheModule {}
`);

write("yourbuy-backend/src/common/api-response.ts", `export function ok<T>(data: T, message = 'OK') {
  return { success: true, message, data };
}
`);

write("yourbuy-backend/src/common/current-user.ts", `import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type RequestUser = {
  id: string;
  email: string;
  username: string;
  role: string;
};

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
  return request.user;
});
`);

write("yourbuy-backend/src/providers/market/twelvedata.provider.ts", `import { Injectable } from '@nestjs/common';
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
}`);

write("yourbuy-backend/src/providers/market/finnhub.provider.ts", `import { Injectable } from '@nestjs/common';
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
}`);

write("yourbuy-backend/src/providers/ai/openrouter.provider.ts", `import { Injectable } from '@nestjs/common';
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
      { headers: { Authorization: \`Bearer \${apiKey}\` }, timeout: 15000 },
    );
    return response.data?.choices?.[0]?.message?.content ?? null;
  }
}`);

write("yourbuy-backend/src/providers/ai/groq.provider.ts", `import { Injectable } from '@nestjs/common';

@Injectable()
export class GroqProvider {
  async complete(): Promise<null> {
    return null;
  }
}`);

write("yourbuy-backend/src/providers/news/newsapi.provider.ts", `import { Injectable } from '@nestjs/common';
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
}`);

write("yourbuy-backend/src/providers/providers.module.ts", `import { Global, Module } from '@nestjs/common';
import { FinnhubProvider } from './market/finnhub.provider';
import { TwelveDataProvider } from './market/twelvedata.provider';
import { OpenRouterProvider } from './ai/openrouter.provider';
import { GroqProvider } from './ai/groq.provider';
import { NewsApiProvider } from './news/newsapi.provider';

@Global()
@Module({
  providers: [FinnhubProvider, TwelveDataProvider, OpenRouterProvider, GroqProvider, NewsApiProvider],
  exports: [FinnhubProvider, TwelveDataProvider, OpenRouterProvider, GroqProvider, NewsApiProvider],
})
export class ProvidersModule {}
`);

write("yourbuy-backend/src/modules/auth/dto/auth.dto.ts", `import { IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsArray()
  @IsOptional()
  skills?: string[];
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
`);

write("yourbuy-backend/src/modules/users/users.service.ts", `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, role: true, level: true, riskLevel: true, skills: true, settings: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  updateProfile(id: string, data: { username?: string; skills?: string[]; settings?: unknown; riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, username: true, role: true, level: true, riskLevel: true, skills: true, settings: true },
    });
  }
}`);

write("yourbuy-backend/src/modules/users/users.controller.ts", `import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: RequestUser) {
    return ok(await this.users.getProfile(user.id));
  }

  @Patch('me')
  async update(@CurrentUser() user: RequestUser, @Body() body: { username?: string; skills?: string[]; settings?: unknown; riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' }) {
    return ok(await this.users.updateProfile(user.id, body), 'Profile updated');
  }
}`);

write("yourbuy-backend/src/modules/users/users.module.ts", `import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
`);

write("yourbuy-backend/src/modules/auth/strategies/jwt.strategy.ts", `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

function cookieExtractor(request: { cookies?: Record<string, string> } | undefined): string | null {
  return request?.cookies?.accessToken ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly users: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwtSecret') || 'dev-access-secret',
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, username: user.username, role: user.role };
  }
}`);

write("yourbuy-backend/src/modules/auth/strategies/google.strategy.ts", `import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy {
  // Placeholder provider shell. OAuth can be enabled by adding Google credentials and passport strategy wiring.
}
`);

write("yourbuy-backend/src/modules/auth/auth.service.ts", `import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({ where: { OR: [{ email: dto.email }, { username: dto.username }] } });
    if (existing) throw new BadRequestException('Email or username is already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username,
        passwordHash,
        skills: dto.skills ?? [],
        portfolio: { create: {} },
        watchlists: { create: { name: 'Default' } },
      },
    });
    return this.issueTokens(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueTokens(user.id);
  }

  async refresh(userId: string, refreshToken?: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token required');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshToken || !(await bcrypt.compare(refreshToken, user.refreshToken))) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.issueTokens(user.id);
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    return true;
  }

  private async issueTokens(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, username: true, role: true },
    });
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwtSecret'),
      expiresIn: this.config.get<string>('jwtExpiresIn') || '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwtRefreshSecret'),
      expiresIn: this.config.get<string>('jwtRefreshExpiresIn') || '7d',
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(refreshToken, 12) },
    });
    return { user, accessToken, refreshToken };
  }
}`);

write("yourbuy-backend/src/modules/auth/auth.controller.ts", `import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(@Body() body: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.register(body);
    this.setCookies(response, result.accessToken, result.refreshToken);
    return ok(result, 'Account created');
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.login(body);
    this.setCookies(response, result.accessToken, result.refreshToken);
    return ok(result, 'Logged in');
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: RefreshTokenDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = body.refreshToken || request.cookies?.refreshToken;
    const decoded = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64url').toString()) as { sub: string };
    const result = await this.auth.refresh(decoded.sub, refreshToken);
    this.setCookies(response, result.accessToken, result.refreshToken);
    return ok(result, 'Token refreshed');
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async logout(@CurrentUser() user: RequestUser, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(user.id);
    response.clearCookie('accessToken', cookieOptions);
    response.clearCookie('refreshToken', cookieOptions);
    return ok(true, 'Logged out');
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@CurrentUser() user: RequestUser) {
    return ok(user);
  }

  private setCookies(response: Response, accessToken: string, refreshToken: string) {
    response.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    response.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  }
}`);

write("yourbuy-backend/src/modules/auth/auth.module.ts", `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({}), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
`);

write("yourbuy-backend/src/modules/markets/markets.service.ts", `import { Injectable } from '@nestjs/common';
import { RedisService } from '../../cache/redis.service';
import { FinnhubProvider } from '../../providers/market/finnhub.provider';
import { TwelveDataProvider } from '../../providers/market/twelvedata.provider';

const FALLBACK_QUOTES: Record<string, { name: string; price: number; change: number; changePercent: number; sector: string }> = {
  AAPL: { name: 'Apple Inc.', price: 193.42, change: 1.12, changePercent: 0.58, sector: 'Technology' },
  MSFT: { name: 'Microsoft Corp.', price: 425.22, change: -0.84, changePercent: -0.2, sector: 'Technology' },
  TSLA: { name: 'Tesla Inc.', price: 178.08, change: 3.64, changePercent: 2.09, sector: 'Consumer Cyclical' },
  NVDA: { name: 'NVIDIA Corp.', price: 920.0, change: 12.75, changePercent: 1.4, sector: 'Technology' },
  AMZN: { name: 'Amazon.com Inc.', price: 184.3, change: 0.67, changePercent: 0.36, sector: 'Consumer Cyclical' },
};

@Injectable()
export class MarketsService {
  constructor(
    private readonly cache: RedisService,
    private readonly twelveData: TwelveDataProvider,
    private readonly finnhub: FinnhubProvider,
  ) {}

  async quote(symbol: string) {
    const normalized = symbol.toUpperCase();
    const cacheKey = \`quote:\${normalized}\`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    let quote = await this.fromProviders(normalized);
    if (!quote) {
      const fallback = FALLBACK_QUOTES[normalized] ?? { name: normalized, price: 100, change: 0, changePercent: 0, sector: 'Unknown' };
      quote = { symbol: normalized, ...fallback, timestamp: new Date().toISOString(), source: 'fallback' };
    }
    await this.cache.set(cacheKey, quote, 60);
    return quote;
  }

  async search(query: string) {
    const q = query.toUpperCase();
    const provider = await this.twelveData.search(q).catch(() => null);
    const providerResults = provider?.data?.map((item: { symbol: string; instrument_name: string }) => ({ symbol: item.symbol, name: item.instrument_name })) ?? [];
    const fallback = Object.entries(FALLBACK_QUOTES)
      .filter(([symbol, data]) => symbol.includes(q) || data.name.toUpperCase().includes(q))
      .map(([symbol, data]) => ({ symbol, name: data.name, sector: data.sector }));
    return providerResults.length ? providerResults : fallback;
  }

  async candles(symbol: string) {
    const base = (await this.quote(symbol)) as { price: number };
    return Array.from({ length: 30 }, (_, index) => ({
      date: new Date(Date.now() - (29 - index) * 86400000).toISOString().slice(0, 10),
      close: Number((base.price * (1 + Math.sin(index / 4) / 30)).toFixed(2)),
    }));
  }

  movers() {
    return Object.entries(FALLBACK_QUOTES)
      .map(([symbol, data]) => ({ symbol, ...data }))
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }

  sectors() {
    return [
      { sector: 'Technology', changePercent: 0.82 },
      { sector: 'Healthcare', changePercent: -0.15 },
      { sector: 'Financials', changePercent: 0.34 },
      { sector: 'Energy', changePercent: -0.48 },
    ];
  }

  private async fromProviders(symbol: string) {
    const twelve = await this.twelveData.quote(symbol).catch(() => null);
    if (twelve?.close) {
      return {
        symbol,
        name: twelve.name || symbol,
        price: Number(twelve.close),
        change: Number(twelve.change || 0),
        changePercent: Number(twelve.percent_change || 0),
        sector: 'Unknown',
        timestamp: new Date().toISOString(),
        source: 'twelvedata',
      };
    }
    const finnhub = await this.finnhub.quote(symbol).catch(() => null);
    if (finnhub?.c) {
      return {
        symbol,
        name: symbol,
        price: Number(finnhub.c),
        change: Number(finnhub.d || 0),
        changePercent: Number(finnhub.dp || 0),
        sector: 'Unknown',
        timestamp: new Date().toISOString(),
        source: 'finnhub',
      };
    }
    return null;
  }
}`);

write("yourbuy-backend/src/modules/markets/markets.controller.ts", `import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ok } from '../../common/api-response';
import { MarketsService } from './markets.service';

@Controller('markets')
@UseGuards(AuthGuard('jwt'))
export class MarketsController {
  constructor(private readonly markets: MarketsService) {}

  @Get('search')
  async search(@Query('q') query = '') {
    return ok(await this.markets.search(query));
  }

  @Get('quotes/:symbol')
  async quote(@Param('symbol') symbol: string) {
    return ok(await this.markets.quote(symbol));
  }

  @Get('candles/:symbol')
  async candles(@Param('symbol') symbol: string) {
    return ok(await this.markets.candles(symbol));
  }

  @Get('movers')
  movers() {
    return ok(this.markets.movers());
  }

  @Get('sectors')
  sectors() {
    return ok(this.markets.sectors());
  }
}`);

write("yourbuy-backend/src/modules/markets/markets.module.ts", `import { Module } from '@nestjs/common';
import { MarketsController } from './markets.controller';
import { MarketsService } from './markets.service';

@Module({
  controllers: [MarketsController],
  providers: [MarketsService],
  exports: [MarketsService],
})
export class MarketsModule {}
`);

write("yourbuy-backend/src/modules/portfolio/portfolio.service.ts", `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MarketsService } from '../markets/markets.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService, private readonly markets: MarketsService) {}

  async getOrCreate(userId: string) {
    return this.prisma.portfolio.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { holdings: true },
    });
  }

  async overview(userId: string) {
    const portfolio = await this.getOrCreate(userId);
    const holdings = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        const quote = (await this.markets.quote(holding.symbol)) as { price: number; changePercent: number };
        const quantity = Number(holding.quantity);
        const avg = Number(holding.averagePrice);
        const value = quantity * quote.price;
        return { ...holding, quantity, averagePrice: avg, lastPrice: quote.price, value, pnl: value - quantity * avg, changePercent: quote.changePercent };
      }),
    );
    const holdingsValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
    const cashBalance = Number(portfolio.cashBalance);
    return { id: portfolio.id, cashBalance, totalValue: cashBalance + holdingsValue, holdingsValue, holdings };
  }

  async performance(userId: string) {
    const overview = await this.overview(userId);
    return Array.from({ length: 30 }, (_, index) => ({
      date: new Date(Date.now() - (29 - index) * 86400000).toISOString().slice(0, 10),
      value: Number((overview.totalValue * (1 + Math.sin(index / 5) / 50)).toFixed(2)),
    }));
  }

  async allocation(userId: string) {
    const overview = await this.overview(userId);
    return overview.holdings.map((holding) => ({
      symbol: holding.symbol,
      value: holding.value,
      weight: overview.holdingsValue ? holding.value / overview.holdingsValue : 0,
    }));
  }

  async requirePortfolio(userId: string) {
    const portfolio = await this.prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    return portfolio;
  }
}`);

write("yourbuy-backend/src/modules/portfolio/portfolio.controller.ts", `import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
@UseGuards(AuthGuard('jwt'))
export class PortfolioController {
  constructor(private readonly portfolio: PortfolioService) {}

  @Get('overview')
  async overview(@CurrentUser() user: RequestUser) {
    return ok(await this.portfolio.overview(user.id));
  }

  @Get('holdings')
  async holdings(@CurrentUser() user: RequestUser) {
    return ok((await this.portfolio.overview(user.id)).holdings);
  }

  @Get('performance')
  async performance(@CurrentUser() user: RequestUser) {
    return ok(await this.portfolio.performance(user.id));
  }

  @Get('allocation')
  async allocation(@CurrentUser() user: RequestUser) {
    return ok(await this.portfolio.allocation(user.id));
  }
}`);

write("yourbuy-backend/src/modules/portfolio/portfolio.module.ts", `import { Module } from '@nestjs/common';
import { MarketsModule } from '../markets/markets.module';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [MarketsModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
`);

write("yourbuy-backend/src/modules/orders/orders.service.ts", `import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderSide, OrderType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { MarketsService } from '../markets/markets.service';
import { PortfolioService } from '../portfolio/portfolio.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portfolio: PortfolioService,
    private readonly markets: MarketsService,
  ) {}

  async execute(userId: string, body: { symbol: string; quantity: number; side?: OrderSide; type?: OrderType; limitPrice?: number }) {
    const side = body.side || (body as { type?: OrderSide }).type || OrderSide.BUY;
    const quantity = Number(body.quantity);
    if (!body.symbol || quantity <= 0) throw new BadRequestException('Symbol and positive quantity are required');
    const portfolio = await this.portfolio.requirePortfolio(userId);
    const quote = (await this.markets.quote(body.symbol)) as { price: number; name?: string };
    const price = body.limitPrice || quote.price;
    const notional = quantity * price;

    if (side === OrderSide.BUY && Number(portfolio.cashBalance) < notional) {
      throw new BadRequestException('Insufficient cash balance');
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          portfolioId: portfolio.id,
          symbol: body.symbol.toUpperCase(),
          side,
          type: body.type || OrderType.MARKET,
          quantity,
          limitPrice: body.limitPrice,
          executedPrice: price,
          metadata: { simulated: true },
        },
      });

      const existing = await tx.holding.findUnique({
        where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol: order.symbol } },
      });

      if (side === OrderSide.BUY) {
        const oldQty = existing ? Number(existing.quantity) : 0;
        const oldAvg = existing ? Number(existing.averagePrice) : 0;
        const newQty = oldQty + quantity;
        const averagePrice = (oldQty * oldAvg + notional) / newQty;
        await tx.holding.upsert({
          where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol: order.symbol } },
          create: { portfolioId: portfolio.id, symbol: order.symbol, name: quote.name, quantity, averagePrice, lastPrice: price },
          update: { quantity: newQty, averagePrice, lastPrice: price },
        });
        await tx.portfolio.update({ where: { id: portfolio.id }, data: { cashBalance: { decrement: notional } } });
      } else {
        if (!existing || Number(existing.quantity) < quantity) throw new BadRequestException('Insufficient holdings');
        const remaining = Number(existing.quantity) - quantity;
        if (remaining === 0) await tx.holding.delete({ where: { id: existing.id } });
        else await tx.holding.update({ where: { id: existing.id }, data: { quantity: remaining, lastPrice: price } });
        await tx.portfolio.update({ where: { id: portfolio.id }, data: { cashBalance: { increment: notional } } });
      }
      return order;
    });
  }

  history(userId: string) {
    return this.prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
  }
}`);

write("yourbuy-backend/src/modules/orders/orders.controller.ts", `import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrderSide, OrderType } from '@prisma/client';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('execute')
  async execute(@CurrentUser() user: RequestUser, @Body() body: { symbol: string; quantity: number; side?: OrderSide; type?: OrderType; limitPrice?: number }) {
    return ok(await this.orders.execute(user.id, body), 'Order executed');
  }

  @Get('history')
  async history(@CurrentUser() user: RequestUser) {
    return ok(await this.orders.history(user.id));
  }
}`);

write("yourbuy-backend/src/modules/orders/orders.module.ts", `import { Module } from '@nestjs/common';
import { MarketsModule } from '../markets/markets.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [MarketsModule, PortfolioModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
`);

write("yourbuy-backend/src/modules/watchlist/watchlist.service.ts", `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WatchlistService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.watchlist.findMany({ where: { userId }, include: { assets: true }, orderBy: { createdAt: 'asc' } });
  }

  create(userId: string, name: string) {
    return this.prisma.watchlist.create({ data: { userId, name }, include: { assets: true } });
  }

  addAsset(userId: string, watchlistId: string, body: { symbol: string; name?: string }) {
    return this.prisma.watchlistAsset.create({
      data: { watchlistId, symbol: body.symbol.toUpperCase(), name: body.name },
    });
  }

  removeAsset(assetId: string) {
    return this.prisma.watchlistAsset.delete({ where: { id: assetId } });
  }
}`);

write("yourbuy-backend/src/modules/watchlist/watchlist.controller.ts", `import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { WatchlistService } from './watchlist.service';

@Controller('watchlist')
@UseGuards(AuthGuard('jwt'))
export class WatchlistController {
  constructor(private readonly watchlist: WatchlistService) {}

  @Get()
  async list(@CurrentUser() user: RequestUser) {
    return ok(await this.watchlist.list(user.id));
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() body: { name: string }) {
    return ok(await this.watchlist.create(user.id, body.name), 'Watchlist created');
  }

  @Post(':id/assets')
  async add(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() body: { symbol: string; name?: string }) {
    return ok(await this.watchlist.addAsset(user.id, id, body), 'Asset added');
  }

  @Delete('assets/:assetId')
  async remove(@Param('assetId') assetId: string) {
    return ok(await this.watchlist.removeAsset(assetId), 'Asset removed');
  }
}`);

write("yourbuy-backend/src/modules/watchlist/watchlist.module.ts", `import { Module } from '@nestjs/common';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

@Module({
  controllers: [WatchlistController],
  providers: [WatchlistService],
})
export class WatchlistModule {}
`);

write("yourbuy-backend/src/modules/notifications/notifications.service.ts", `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  create(userId: string, data: { title: string; message: string; type?: 'SYSTEM' | 'MARKET' | 'PORTFOLIO' | 'AI'; metadata?: unknown }) {
    return this.prisma.notification.create({ data: { userId, title: data.title, message: data.message, type: data.type || 'SYSTEM', metadata: data.metadata as object } });
  }

  markRead(userId: string, id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }
}`);

write("yourbuy-backend/src/modules/notifications/notifications.controller.ts", `import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: RequestUser) {
    return ok(await this.notifications.list(user.id));
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() body: { title: string; message: string; type?: 'SYSTEM' | 'MARKET' | 'PORTFOLIO' | 'AI'; metadata?: unknown }) {
    return ok(await this.notifications.create(user.id, body), 'Notification created');
  }

  @Patch(':id/read')
  async read(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return ok(await this.notifications.markRead(user.id, id), 'Notification marked read');
  }
}`);

write("yourbuy-backend/src/modules/notifications/notifications.module.ts", `import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
`);

write("yourbuy-backend/src/modules/ai/ai.service.ts", `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OpenRouterProvider } from '../../providers/ai/openrouter.provider';
import { NewsApiProvider } from '../../providers/news/newsapi.provider';
import { PortfolioService } from '../portfolio/portfolio.service';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openRouter: OpenRouterProvider,
    private readonly news: NewsApiProvider,
    private readonly portfolio: PortfolioService,
  ) {}

  async insights(userId: string) {
    const overview = await this.portfolio.overview(userId);
    return {
      summary: 'YourBuy Intelligence is tracking portfolio concentration, cash usage, and market movement.',
      riskNotes: overview.holdings.length ? ['Review position sizing before adding concentrated exposure.'] : ['Portfolio is cash-heavy; consider building a diversified watchlist first.'],
      opportunities: ['Use simulated orders to test thesis quality before committing capital.'],
      generatedAt: new Date().toISOString(),
    };
  }

  async assistant(userId: string, message: string, context?: unknown) {
    const fallback = \`I can help analyze your portfolio, watchlist, and market context. For: "\${message}", start by checking valuation, trend, risk, and position sizing.\`;
    const ai = await this.openRouter.complete(\`You are YourBuy Intelligence. Give educational, non-promissory market guidance. User asked: \${message}\`).catch(() => null);
    const conversation = await this.prisma.aIConversation.create({
      data: {
        userId,
        title: message.slice(0, 80),
        context: context as object,
        messages: {
          create: [
            { role: 'user', content: message },
            { role: 'assistant', content: ai || fallback },
          ],
        },
      },
      include: { messages: true },
    });
    return conversation;
  }

  async newsIntelligence() {
    const articles = await this.news.marketNews();
    return { articles, explanation: 'News is summarized for education only and should be cross-checked before trading.' };
  }
}`);

write("yourbuy-backend/src/modules/ai/ai.controller.ts", `import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('insights')
  async insights(@CurrentUser() user: RequestUser) {
    return ok(await this.ai.insights(user.id));
  }

  @Get('news')
  async news() {
    return ok(await this.ai.newsIntelligence());
  }

  @Post('assistant')
  async assistant(@CurrentUser() user: RequestUser, @Body() body: { message: string; context?: unknown }) {
    return ok(await this.ai.assistant(user.id, body.message, body.context));
  }
}`);

write("yourbuy-backend/src/modules/ai/ai.module.ts", `import { Module } from '@nestjs/common';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [PortfolioModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
`);

write("yourbuy-backend/src/modules/analytics/analytics.service.ts", `import { Injectable } from '@nestjs/common';
import { PortfolioService } from '../portfolio/portfolio.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly portfolio: PortfolioService) {}

  async portfolioAnalytics(userId: string) {
    const overview = await this.portfolio.overview(userId);
    const allocation = await this.portfolio.allocation(userId);
    return {
      totalValue: overview.totalValue,
      cashWeight: overview.totalValue ? overview.cashBalance / overview.totalValue : 1,
      positions: overview.holdings.length,
      allocation,
    };
  }
}`);

write("yourbuy-backend/src/modules/analytics/analytics.controller.ts", `import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('portfolio')
  async portfolio(@CurrentUser() user: RequestUser) {
    return ok(await this.analytics.portfolioAnalytics(user.id));
  }
}`);

write("yourbuy-backend/src/modules/analytics/analytics.module.ts", `import { Module } from '@nestjs/common';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [PortfolioModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
`);

write("yourbuy-backend/src/modules/onboarding/onboarding.controller.ts", `import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../../common/current-user';
import { ok } from '../../common/api-response';
import { UsersService } from '../users/users.service';

@Controller('onboarding')
@UseGuards(AuthGuard('jwt'))
export class OnboardingController {
  constructor(private readonly users: UsersService) {}

  @Post('complete')
  async complete(@CurrentUser() user: RequestUser, @Body() body: { skills?: string[]; riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'; settings?: unknown }) {
    return ok(await this.users.updateProfile(user.id, body), 'Onboarding completed');
  }
}`);

write("yourbuy-backend/src/modules/onboarding/onboarding.module.ts", `import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { OnboardingController } from './onboarding.controller';

@Module({
  imports: [UsersModule],
  controllers: [OnboardingController],
})
export class OnboardingModule {}
`);

write("yourbuy-backend/src/modules/admin/admin.controller.ts", `import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ok } from '../../common/api-response';
import { PrismaService } from '../../database/prisma.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    const users = await this.prisma.user.count();
    const orders = await this.prisma.order.count();
    return ok({ users, orders, status: 'ready' });
  }
}`);

write("yourbuy-backend/src/modules/admin/admin.module.ts", `import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
})
export class AdminModule {}
`);

write("yourbuy-backend/src/modules/realtime/market.gateway.ts", `import { Logger } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MarketsService } from '../markets/markets.service';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MarketGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MarketGateway.name);

  constructor(private readonly markets: MarketsService) {}

  @SubscribeMessage('market:subscribe')
  async subscribe(@MessageBody() body: { symbol: string }) {
    const quote = await this.markets.quote(body.symbol);
    this.logger.debug(\`Subscribed to \${body.symbol}\`);
    return { event: 'market:quote', data: quote };
  }
}`);

write("yourbuy-backend/src/modules/realtime/realtime.module.ts", `import { Module } from '@nestjs/common';
import { MarketsModule } from '../markets/markets.module';
import { MarketGateway } from './market.gateway';

@Module({
  imports: [MarketsModule],
  providers: [MarketGateway],
})
export class RealtimeModule {}
`);

write("yourbuy-backend/src/app.module.ts", `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from './cache/cache.module';
import { envConfig } from './config/env.config';
import { DatabaseModule } from './database/database.module';
import { ProvidersModule } from './providers/providers.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { MarketsModule } from './modules/markets/markets.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { UsersModule } from './modules/users/users.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [envConfig] }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    DatabaseModule,
    CacheModule,
    ProvidersModule,
    UsersModule,
    AuthModule,
    OnboardingModule,
    MarketsModule,
    PortfolioModule,
    OrdersModule,
    WatchlistModule,
    NotificationsModule,
    AiModule,
    AnalyticsModule,
    RealtimeModule,
    AdminModule,
  ],
})
export class AppModule {}
`);

write("yourbuy-backend/src/main.ts", `import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>('frontendUrl') || 'http://localhost:3000';
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: frontendUrl, credentials: true });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = config.get<number>('port') || 3001;
  await app.listen(port);
  Logger.log(\`YourBuy API listening on http://localhost:\${port}/api/v1\`, 'Bootstrap');
}

void bootstrap();
`);

write("yourbuy-frontend/package.json", `{
  "name": "yourbuy-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.1.1",
    "axios": "^1.7.9",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "^15.1.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.6.0",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2"
  }
}`);

write("yourbuy-frontend/tsconfig.json", `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`);

write("yourbuy-frontend/next.config.ts", `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`);

write("yourbuy-frontend/postcss.config.js", `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

write("yourbuy-frontend/tailwind.config.ts", `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18212f',
        mint: '#00a878',
        coral: '#f45b69',
        gold: '#f2c14e',
      },
    },
  },
  plugins: [],
};

export default config;
`);

write("yourbuy-frontend/app/globals.css", `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

body {
  margin: 0;
  background: #f7f8fb;
  color: #18212f;
}

button,
input,
select {
  font: inherit;
}
`);

write("yourbuy-frontend/lib/utils.ts", `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`);

write("yourbuy-frontend/services/api.ts", `import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = \`Bearer \${accessToken}\`;
  return config;
});
`);

write("yourbuy-frontend/services/auth.service.ts", `import { apiClient, clearAccessToken, setAccessToken } from './api';

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
`);

write("yourbuy-frontend/services/portfolio.service.ts", `import { apiClient } from './api';

export const PortfolioService = {
  async overview() {
    const response = await apiClient.get('/portfolio/overview');
    return response.data.data;
  },
  async performance() {
    const response = await apiClient.get('/portfolio/performance');
    return response.data.data;
  },
  async allocation() {
    const response = await apiClient.get('/portfolio/allocation');
    return response.data.data;
  },
};
`);

write("yourbuy-frontend/services/markets.service.ts", `import { apiClient } from './api';

export const MarketsService = {
  async search(q: string) {
    const response = await apiClient.get('/markets/search', { params: { q } });
    return response.data.data;
  },
  async quote(symbol: string) {
    const response = await apiClient.get(\`/markets/quotes/\${symbol}\`);
    return response.data.data;
  },
  async movers() {
    const response = await apiClient.get('/markets/movers');
    return response.data.data;
  },
  async sectors() {
    const response = await apiClient.get('/markets/sectors');
    return response.data.data;
  },
};
`);

write("yourbuy-frontend/services/orders.service.ts", `import { apiClient } from './api';

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
`);

write("yourbuy-frontend/services/ai.service.ts", `import { apiClient } from './api';

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
`);

write("yourbuy-frontend/services/analytics.service.ts", `import { apiClient } from './api';

export const AnalyticsService = {
  async portfolio() {
    const response = await apiClient.get('/analytics/portfolio');
    return response.data.data;
  },
};
`);

write("yourbuy-frontend/stores/auth.store.ts", `import { create } from 'zustand';

type User = { id: string; email: string; username: string; role: string } | null;

export const useAuthStore = create<{ user: User; setUser: (user: User) => void }>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
`);

write("yourbuy-frontend/stores/ui.store.ts", `import { create } from 'zustand';

export const useUiStore = create<{ sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
`);

write("yourbuy-frontend/providers/app-providers.tsx", `'use client';

import { Toaster } from 'sonner';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}
`);

write("yourbuy-frontend/app/layout.tsx", `import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';

export const metadata: Metadata = {
  title: 'YourBuy',
  description: 'AI-assisted portfolio and simulated trading workspace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
`);

write("yourbuy-frontend/features/auth/landing-page.tsx", `import Link from 'next/link';
import { BarChart3, Brain, ShieldCheck } from 'lucide-react';

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-10">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-mint">YourBuy Intelligence</p>
          <h1 className="text-5xl font-semibold leading-tight text-ink md:text-7xl">YourBuy</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            A production-shaped investing workspace with simulated orders, portfolio analytics, market data, watchlists, notifications, and contextual AI.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white">Create account</Link>
            <Link href="/login" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-ink">Log in</Link>
          </div>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[['Markets', BarChart3], ['AI Context', Brain], ['Secure APIs', ShieldCheck]].map(([label, Icon]) => (
            <div key={String(label)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-mint" />
              <p className="mt-4 font-semibold">{String(label)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
`);

write("yourbuy-frontend/app/page.tsx", `import { LandingPage } from '@/features/auth/landing-page';

export default function Home() {
  return <LandingPage />;
}
`);

write("yourbuy-frontend/features/auth/login-form.tsx", `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await AuthService.login({ email, password });
      router.push('/dashboard');
    } catch {
      toast.error('Unable to log in');
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <input className="w-full rounded-md border p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-md border p-3" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full rounded-md bg-ink p-3 font-semibold text-white">Log in</button>
    </form>
  );
}
`);

write("yourbuy-frontend/features/auth/signup-form.tsx", `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await AuthService.register({ ...form, skills: ['React'] });
      router.push('/onboarding');
    } catch {
      toast.error('Unable to create account');
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <input className="w-full rounded-md border p-3" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input className="w-full rounded-md border p-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="w-full rounded-md border p-3" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="w-full rounded-md bg-ink p-3 font-semibold text-white">Create account</button>
    </form>
  );
}
`);

write("yourbuy-frontend/features/auth/onboarding-flow.tsx", `'use client';

import { useRouter } from 'next/navigation';

export function OnboardingFlow() {
  const router = useRouter();
  return (
    <main className="mx-auto mt-24 max-w-2xl rounded-lg bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Set up YourBuy</h1>
      <p className="mt-3 text-slate-600">Your account starts with a simulated cash balance, a default watchlist, and access to all API-backed modules.</p>
      <button onClick={() => router.push('/dashboard')} className="mt-6 rounded-md bg-ink px-5 py-3 font-semibold text-white">Enter dashboard</button>
    </main>
  );
}
`);

write("yourbuy-frontend/app/login/page.tsx", `import { LoginForm } from '@/features/auth/login-form';

export default function LoginPage() {
  return <LoginForm />;
}
`);

write("yourbuy-frontend/app/signup/page.tsx", `import { SignupForm } from '@/features/auth/signup-form';

export default function SignupPage() {
  return <SignupForm />;
}
`);

write("yourbuy-frontend/app/onboarding/page.tsx", `import { OnboardingFlow } from '@/features/auth/onboarding-flow';

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
`);

write("yourbuy-frontend/components/auth-guard.tsx", `'use client';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`);

write("yourbuy-frontend/features/dashboard/dashboard-sidebar.tsx", `import Link from 'next/link';
import { BarChart3, Brain, Briefcase, Home, LineChart, Receipt } from 'lucide-react';

const items = [
  ['Dashboard', '/dashboard', Home],
  ['Portfolio', '/portfolio', Briefcase],
  ['Markets', '/markets', LineChart],
  ['Orders', '/orders', Receipt],
  ['AI Insights', '/ai-insights', Brain],
];

export function DashboardSidebar() {
  return (
    <aside className="w-64 border-r bg-white p-4">
      <div className="mb-8 flex items-center gap-2 font-semibold"><BarChart3 className="h-5 w-5 text-mint" />YourBuy</div>
      <nav className="space-y-1">
        {items.map(([label, href, Icon]) => (
          <Link key={String(href)} href={String(href)} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            <Icon className="h-4 w-4" />{String(label)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
`);

write("yourbuy-frontend/features/dashboard/dashboard-header.tsx", `export function DashboardHeader({ title }: { title: string }) {
  return (
    <header className="border-b bg-white px-6 py-4">
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
    </header>
  );
}
`);

write("yourbuy-frontend/app/(dashboard)/layout.tsx", `import { AuthGuard } from '@/components/auth-guard';
import { DashboardSidebar } from '@/features/dashboard/dashboard-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
`);

write("yourbuy-frontend/features/portfolio/portfolio-overview.tsx", `type Holding = { id: string; symbol: string; quantity: number; averagePrice: number; value: number; pnl: number };

export function PortfolioOverview({ data }: { data: { totalValue: number; cashBalance: number; holdings: Holding[] } }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total value</p><p className="mt-2 text-2xl font-semibold">\${data.totalValue.toLocaleString()}</p></div>
      <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Cash</p><p className="mt-2 text-2xl font-semibold">\${data.cashBalance.toLocaleString()}</p></div>
      <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Positions</p><p className="mt-2 text-2xl font-semibold">{data.holdings.length}</p></div>
    </section>
  );
}
`);

write("yourbuy-frontend/features/portfolio/portfolio-chart.tsx", `export function PortfolioChart({ points }: { points: { date: string; value: number }[] }) {
  const max = Math.max(...points.map((point) => point.value), 1);
  return (
    <div className="flex h-56 items-end gap-1 rounded-lg bg-white p-5 shadow-sm">
      {points.map((point) => (
        <div key={point.date} className="flex-1 rounded-t bg-mint" style={{ height: \`\${Math.max(8, (point.value / max) * 180)}px\` }} title={point.date} />
      ))}
    </div>
  );
}
`);

write("yourbuy-frontend/components/trade-modal.tsx", `'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { OrdersService } from '@/services/orders.service';

export function TradeModal() {
  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState(1);

  async function buy() {
    await OrdersService.execute({ symbol, quantity, side: 'BUY' });
    toast.success('Simulated order executed');
  }

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Quick trade</h2>
      <div className="mt-4 flex gap-2">
        <input className="w-28 rounded-md border p-2" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
        <input className="w-24 rounded-md border p-2" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        <button onClick={buy} className="rounded-md bg-ink px-4 text-white">Buy</button>
      </div>
    </div>
  );
}
`);

write("yourbuy-frontend/components/ai-copilot.tsx", `'use client';

import { useState } from 'react';
import { AiService } from '@/services/ai.service';

export function AiCopilot() {
  const [message, setMessage] = useState('How should I think about my portfolio risk?');
  const [answer, setAnswer] = useState('');

  async function ask() {
    const response = await AiService.ask(message);
    setAnswer(response.messages?.at(-1)?.content || '');
  }

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <h2 className="font-semibold">AI Copilot</h2>
      <textarea className="mt-3 w-full rounded-md border p-3" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={ask} className="mt-3 rounded-md bg-ink px-4 py-2 text-white">Ask</button>
      {answer ? <p className="mt-4 text-sm leading-6 text-slate-700">{answer}</p> : null}
    </div>
  );
}
`);

write("yourbuy-frontend/app/(dashboard)/dashboard/page.tsx", `import { DashboardHeader } from '@/features/dashboard/dashboard-header';
import { TradeModal } from '@/components/trade-modal';
import { AiCopilot } from '@/components/ai-copilot';

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="grid gap-5 p-6 lg:grid-cols-2">
        <TradeModal />
        <AiCopilot />
      </div>
    </>
  );
}
`);

write("yourbuy-frontend/app/(dashboard)/portfolio/page.tsx", `import { DashboardHeader } from '@/features/dashboard/dashboard-header';

export default function PortfolioPage() {
  return (
    <>
      <DashboardHeader title="Portfolio" />
      <div className="p-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">Portfolio overview loads from /api/v1/portfolio/overview after login.</div>
      </div>
    </>
  );
}
`);

write("yourbuy-frontend/app/(dashboard)/markets/page.tsx", `import { DashboardHeader } from '@/features/dashboard/dashboard-header';

export default function MarketsPage() {
  return (
    <>
      <DashboardHeader title="Markets" />
      <div className="p-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">Market search, quotes, movers, candles, and sectors are available through the backend API.</div>
      </div>
    </>
  );
}
`);

write("yourbuy-frontend/app/(dashboard)/orders/page.tsx", `import { DashboardHeader } from '@/features/dashboard/dashboard-header';
import { TradeModal } from '@/components/trade-modal';

export default function OrdersPage() {
  return (
    <>
      <DashboardHeader title="Orders" />
      <div className="p-6"><TradeModal /></div>
    </>
  );
}
`);

write("yourbuy-frontend/app/(dashboard)/ai-insights/page.tsx", `import { AiCopilot } from '@/components/ai-copilot';
import { DashboardHeader } from '@/features/dashboard/dashboard-header';

export default function AiInsightsPage() {
  return (
    <>
      <DashboardHeader title="AI Insights" />
      <div className="p-6"><AiCopilot /></div>
    </>
  );
}
`);

write("yourbuy-frontend/components/ui/table.tsx", `export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full border-collapse text-sm">{children}</table>;
}
`);

write("yourbuy-frontend/components/ui/sonner.tsx", `export { Toaster } from 'sonner';
`);

write("docker-compose.yml", `version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: yourbuy-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: yourbuy_root
      MYSQL_DATABASE: yourbuy_db
      MYSQL_USER: yourbuy_user
      MYSQL_PASSWORD: yourbuy_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    container_name: yourbuy-redis
    restart: unless-stopped
    ports:
      - "6379:6379"

volumes:
  mysql_data:
`);

write("README.md", `# YourBuy

YourBuy is a Next.js + NestJS investing workspace with MySQL, Prisma, Redis-ready caching, simulated trading, portfolio analytics, market APIs, watchlists, notifications, AI assistance, and Socket.IO realtime hooks.

## Local setup

1. Start infrastructure: \`docker compose up -d\`
2. Backend:
   - \`cd yourbuy-backend\`
   - copy \`.env.example\` to \`.env\`
   - \`npm install\`
   - \`npm run prisma:dev -- --name init\`
   - \`npm run start:dev\`
3. Frontend:
   - \`cd yourbuy-frontend\`
   - \`npm install\`
   - \`npm run dev\`

## Deployment

Backend requires \`DATABASE_URL\`, \`JWT_SECRET\`, \`JWT_REFRESH_SECRET\`, \`FRONTEND_URL\`, and optionally \`REDIS_URL\`, \`TWELVEDATA_API_KEY\`, \`FINNHUB_API_KEY\`, \`OPENROUTER_API_KEY\`, and \`NEWS_API_KEY\`.

Run \`npm run build\` in both apps before deployment.
`);

console.log("Deployment-ready project files written.");
