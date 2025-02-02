import { PrismaClient, Prisma } from '@prisma/client';
import { prismaClient } from '../config/database';

export class UserService {
  static async detailFromEmail(email: string) {
    const user = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  }

  static async detail(prisma: PrismaClient | Prisma.TransactionClient, id: number) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
}
