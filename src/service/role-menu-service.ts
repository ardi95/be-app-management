import { Prisma } from '@prisma/client';
import { prismaClient } from '../config/database';
import { IRequestRoleMenu } from '../model/role-menu-model';
import { RoleService } from './role-service';

export class RoleMenuService {
  static async index(role_id: number, menu_id: number) {
    const where: Prisma.MenuWhereInput = {};

    if (menu_id === 0) {
      where.menu_id = null;
    } else {
      where.menu_id = menu_id;
    }

    where.active = 'Active';

    const menus = await prismaClient.menu.findMany({
      where,
      orderBy: [
        {
          order_number: 'asc',
        },
        {
          id: 'asc',
        },
      ],
      include: {
        roles: { // Ganti `roleMenu` dengan `roles` sesuai model relasi di Prisma
          where: { role_id },
          select: {
            access: true,
            create: true,
            update: true,
            delete: true,
            approval: true,
            approval_2: true,
            approval_3: true,
          },
        },
      },
    });

    const formattedMenus = menus.map((menu) => {
      const roleMenu = menu.roles[0]; // Ambil data dari role_menu jika ada

      return {
        id: menu.id,
        name: menu.name,
        url: menu.url,
        order_number: menu.order_number,
        permissions: {
          access: roleMenu?.access ?? false,
          create: roleMenu?.create ?? false,
          update: roleMenu?.update ?? false,
          delete: roleMenu?.delete ?? false,
          approval: roleMenu?.approval ?? false,
          approval_2: roleMenu?.approval_2 ?? false,
          approval_3: roleMenu?.approval_3 ?? false,
        },
      };
    });

    return {
      data: formattedMenus,
    };
  }

  static async store(role_id: number, req: IRequestRoleMenu[]) {
    return prismaClient.$transaction(async (tx) => {
      const upsertPromises = req.map(async (item) => {
        return tx.roleMenu.upsert({
          where: {
            role_id_menu_id: { role_id, menu_id: item.menu_id },
          },
          update: {
            access: item.access,
            create: item.create ?? false,
            update: item.update ?? false,
            delete: item.delete ?? false,
            approval: item.approval ?? false,
            approval_2: item.approval_2 ?? false,
            approval_3: item.approval_3 ?? false,
          },
          create: {
            role: { connect: { id: role_id } },
            menu: { connect: { id: item.menu_id } },
            access: item.access,
            create: item.create ?? false,
            update: item.update ?? false,
            delete: item.delete ?? false,
            approval: item.approval ?? false,
            approval_2: item.approval_2 ?? false,
            approval_3: item.approval_3 ?? false,
          },
        });
      });

      return Promise.all(upsertPromises);
    });
  }
}
