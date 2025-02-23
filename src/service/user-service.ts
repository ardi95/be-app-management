import { PrismaClient, Prisma } from '@prisma/client';
import { prismaClient } from '../config/database';
import { IRequestUser, IUserObject } from '../model/user-model';
import bcrypt from 'bcrypt';
import { IRequestList } from '../model/global-model';

const emailAdmin = process.env.EMAIL_ADMIN || 'admin@gmail.com';
const passAdmin = process.env.PASS_ADMIN || 'admin123';

export class UserService {
  static async index(req: IRequestList, auth: IUserObject) {
    const where: Prisma.UserWhereInput = {};

    /**
     * untuk search global
     */
    if (req.search) {
      where.OR = [
        { name: { contains: req.search, mode: 'insensitive' } },
        { email: { contains: req.search, mode: 'insensitive' } },
      ];
    }

    if (auth.email !== emailAdmin) {
      where.email = { not: emailAdmin };
    }

    /**
     * untuk sort dari FE
     */
    const orderBy: Prisma.UserOrderByWithRelationInput[] = [];

    if (req.order_field && req.order_dir) {
      orderBy.push({ [req.order_field]: req.order_dir });
    }

    /**
     * default sort
     */
    orderBy.push({ id: 'desc' });

    /**
     * pembuatan paging
     */

    let per_page = 10;
    let page = 1;
    if (req.per_page) per_page = req.per_page;
    if (req.page) page = req.page;

    const take = Number(per_page);
    const skip = (Number(page) - 1) * take;

    const users = await prismaClient.user.findMany({
      where,
      orderBy,
      skip,
      take,
    });

    const total = await prismaClient.user.count({
      where
    })

    return {
      data: users,
      total
    };
  }

  static async detailFromEmail(email: string, id: number | null = null) {
    const user = await prismaClient.user.findFirst({
      where: {
        email: email,
        ...(id !== null && { id: { not: id } }),
      },
    });

    return user;
  }

  static async detail(
    prisma: PrismaClient | Prisma.TransactionClient,
    id: number
  ) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  static async store(req: IRequestUser & { user?: IUserObject }) {
    const hashedPassword = await bcrypt.hash(passAdmin, 10);

    const data = await prismaClient.user.create({
      data: {
        email: req.email, // Ambil manual tiap field, jangan gunakan `...req`
        name: req.name,
        gender: req.gender,
        birthdate: new Date(req.birthdate), // Konversi ke Date
        password: hashedPassword,
        active: 'Active',
        created_by: req.user?.id || 0, // Ambil user ID, jika tidak ada set default 0
      },
    });

    return data;
  }

  static async update(id: number, req: IRequestUser, auth: IUserObject) {
    const data = await prismaClient.user.update({
      where: { id },
      data: {
        ...req,
        birthdate: new Date(req.birthdate),
        updated_by: auth.id,
      },
    });

    return data;
  }

  static async resetPassword(id: number) {
    const data = await prismaClient.user.update({
      where: { id },
      data: {
        active: 'Inactive',
        updated_by: id
      },
    });

    return data;
  }
}
