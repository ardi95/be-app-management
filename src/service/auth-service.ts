import { prismaClient } from '../config/database';
import { ResponseError } from '../config/response-error';
import { ILoginRequest } from '../model/auth-model';
import bcrypt from 'bcrypt';
import {
  generateRefreshToken,
  generateToken,
} from '../validation/auth-validation';
import { UserService } from './user-service';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AccessTokenService } from './accessToken-service';
import { IUserObject } from '../model/user-model';
import { IUserObjectRefresh } from '../model/accessToken-model';
import { IMenu } from '../model/menu-model';

export class AuthService {
  static async login(req: ILoginRequest) {
    const user = await UserService.detailFromEmail(req.email);

    if (!user)
      throw new ResponseError(400, ['Email or password is incorrect!']);

    if (user?.active !== 'Active') {
      throw new ResponseError(400, ['User inactive!']);
    }

    const isPasswordValid = await bcrypt.compare(req.password, user.password);

    if (!isPasswordValid)
      throw new ResponseError(400, ['Email or password is incorrect!']);

    const formattedUser: IUserObject = {
      ...user,
      active: user.active === 'Active' ? 'Active' : 'Inactive', // Konversi manual
    };

    const { token, refresh_token } = await AccessTokenService.addToken(
      prismaClient,
      formattedUser
    );

    return { token, refresh_token, user };
  }

  static async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new ResponseError(403, ['Refresh token not found']);
    }

    const accessToken = await prismaClient.accessToken.findUnique({
      where: {
        refresh_token: refreshToken,
      },
    });

    if (!accessToken) {
      throw new ResponseError(403, ['Refresh token not found']);
    }

    const user = await UserService.detail(prismaClient, accessToken.user_id);

    if (!user) {
      throw new ResponseError(403, ['Refresh token not found']);
    }

    return prismaClient.$transaction(async (prisma) => {
      const formattedUser: IUserObject = {
        ...user,
        active: user.active === 'Active' ? 'Active' : 'Inactive', // Konversi manual
      };

      const { token, refresh_token } = await AccessTokenService.addToken(
        prismaClient,
        formattedUser
      );

      await AccessTokenService.destroy(prisma, refreshToken);

      return { token, refresh_token, user };
    });
  }

  static buildMenuTree(
    menus: IMenu[],
    parentId: number | null = null
  ): IMenu[] {
    return menus
      .filter((menu) => menu.menu_id === parentId)
      .map((menu) => ({
        ...menu,
        children: AuthService.buildMenuTree(menus, menu.id),
      }));
  }

  static async listMenu(auth: IUserObject) {
    const user = await prismaClient.user.findUnique({
      where: { id: auth.id },
      include: {
        role: {
          include: {
            menus: {
              include: {
                menu: {
                  include: {
                    children: true, // Get child menus
                  },
                },
              },
              orderBy: [
                { menu: { order_number: 'asc' } },
                { menu: { id: 'asc' } },
              ],
            },
          },
        },
      },
    });

    if (!user) {
      throw new ResponseError(404, ['Data Not Found!']);
    }

    const flatMenus = user.role.menus.map((roleMenu) => roleMenu.menu);
    const nestedMenus = await AuthService.buildMenuTree(flatMenus);

    return nestedMenus;
  }
}
