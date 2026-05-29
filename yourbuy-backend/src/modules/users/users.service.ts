import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    const updateData: Prisma.UserUpdateInput = {
      username: data.username,
      skills: data.skills,
      settings: data.settings === undefined ? undefined : (data.settings as Prisma.InputJsonValue),
      riskLevel: data.riskLevel,
    };

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, username: true, role: true, level: true, riskLevel: true, skills: true, settings: true },
    });
  }
}
