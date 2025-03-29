import { Prisma } from '@prisma/client';
import { prismaClient } from '../config/database';
import {
  IRequestMenu,
  IRequestMenuChangeParent,
  IRequestMenuSort,
  IRequestMenuStore,
} from '../model/menu-model';
import { IUserObject } from '../model/user-model';

export class MenuService {
  static async index(id: number) {
    const where: Prisma.MenuWhereInput = {};

    if (id === 0) {
      where.menu_id = null;
    } else {
      where.menu_id = id;
    }

    const data = await prismaClient.menu.findMany({
      include: {
        children: true,
      },
      where,
      orderBy: [
        {
          order_number: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });

    return {
      data,
    };
  }

  static async detail(id: number) {
    return await prismaClient.menu.findUnique({
      include: {
        children: true,
      },
      where: {
        id,
      },
    });
  }

  static async menuLastByParentId(menu_id: number | null) {
    const menuLast = await prismaClient.menu.findFirst({
      where: {
        menu_id,
      },
      orderBy: [
        {
          order_number: 'desc',
        },
        {
          id: 'desc',
        },
      ],
    });

    let order_number = 0;

    if (menuLast) {
      order_number = menuLast.order_number;
    }

    return order_number + 1;
  }

  static async store(req: IRequestMenuStore, auth: IUserObject) {
    const menu_id = req.menu_id ?? null;

    const order_number = await this.menuLastByParentId(menu_id)

    const data = await prismaClient.menu.create({
      data: {
        key_menu: req.key_menu,
        name: req.name,
        order_number,
        menu_id,
        active: 'Active',
        created_by: auth.id,
      },
    });

    return data;
  }

  static async update(id: number, req: IRequestMenu, auth: IUserObject) {
    const data = await prismaClient.menu.update({
      where: { id },
      data: {
        ...req,
        updated_by: auth.id,
      },
    });

    return data;
  }

  static async sort(req: IRequestMenuSort, auth: IUserObject) {
    await prismaClient.$transaction(async (tx) => {
      await Promise.all(
        req.list_menu.map((data, index) =>
          tx.menu.update({
            where: { id: data.id },
            data: {
              order_number: index + 1,
              updated_by: auth.id,
            },
          })
        )
      );
    });
  }

  static async changeParent(id: number, req: IRequestMenuChangeParent, auth: IUserObject) {
    const menu_id = req.menu_id ?? null;

    const order_number = await this.menuLastByParentId(menu_id)

    const data = await prismaClient.menu.update({
      where: {
        id
      },
      data: {
        ...req,
        order_number,
        updated_by: auth.id,
      }
    })

    return data;
  }

  static async destroy(id: number, auth: IUserObject) {
    const data = await prismaClient.menu.update({
      where: { id },
      data: {
        active: 'Inactive',
        updated_by: auth.id,
      },
    });

    return data;
  }

  static async active(id: number, auth: IUserObject) {
    const data = await prismaClient.menu.update({
      where: { id },
      data: {
        active: 'Active',
        updated_by: auth.id,
      },
    });

    return data;
  }
}
