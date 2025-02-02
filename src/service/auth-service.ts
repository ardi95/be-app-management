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

export class AuthService {
  static async login(req: ILoginRequest) {
    const user = await UserService.detailFromEmail(req.email);

    if (!user)
      throw new ResponseError(400, ['Email or password is incorrect!']);

    const isPasswordValid = await bcrypt.compare(req.password, user.password);

    if (!isPasswordValid)
      throw new ResponseError(400, ['Email or password is incorrect!']);

    const { token, refresh_token } = await AccessTokenService.addToken(prismaClient, user);

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

    const user = await UserService.detail(prismaClient, accessToken.user_id)

    if (!user) {
      throw new ResponseError(403, ['Refresh token not found']);
    }

    return prismaClient.$transaction(async (prisma) => {

      const { token, refresh_token } = await AccessTokenService.addToken(prismaClient, user);

      await AccessTokenService.destroy(prisma, refreshToken)

      return { token, refresh_token, user };
    });
  }
}
