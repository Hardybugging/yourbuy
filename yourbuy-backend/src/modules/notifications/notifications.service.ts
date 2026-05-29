import { Injectable } from '@nestjs/common';
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
}