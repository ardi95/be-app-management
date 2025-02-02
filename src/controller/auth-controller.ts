import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../service/auth-service';
import { AccessTokenService } from '../service/accessToken-service';
import { prismaClient } from '../config/database';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await AuthService.login(req.body);

      const { password, ...user } = response.user;

      const data = {
        message: 'Login successful',
        refresh_token: response.refresh_token,
        user,
      };

      res.cookie('token', response.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.status(200).json(data);
    } catch (e) {
      next(e);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    const { refresh_token } = req.body;
    try {
      const response = await AuthService.refreshToken(refresh_token);

      const { password, ...user } = response.user;

      const data = {
        message: 'Login successful',
        refresh_token: response.refresh_token,
        user,
      };

      // Set token baru di cookie
      res.cookie('token', response.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 15 * 60 * 1000,
      });

      res.status(200).json(data);
    } catch (e) {
      next(e); // Tangani error yang terjadi selama refresh token
    }
  }

  static async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.user;

      res.status(200).json({
        message: 'Profile retrieved successfully',
        profile: data,
      });
    } catch (e) {
      next(e);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.token;
      await AccessTokenService.destroyByToken(prismaClient, token)

      res.clearCookie('token');
      res.status(200).json({ message: 'Logout successful' });
    } catch (e) {
      next(e); // Forward error to error handling middleware
    }
  }
}
