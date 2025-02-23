import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';
import { IUserObject } from '../model/user-model';
import { ResponseError } from '../config/response-error';
import { prismaClient } from '../config/database';
import crypto from 'crypto'

const secret = process.env.SECRET_JWT || 'default_secret_key';

const baseSchema = z.object({
  email: z
    .string({ message: `Email is required` })
    .email()
    .min(1, `Email is required`),
  password: z
    .string({ message: `Password is required` })
    .min(1, `Password is required`),
});

const editProfileSchema = z.object({
  name: z
    .string({ message: `The name is required!` })
    .min(1, `The name is required!`),
  gender: z
    .string({ message: `The gender is required!` })
    .min(1, `The gender is required!`),
  birthdate: z
    .string({ message: `The birthdate is required!` })
    .date(`The birthdate format must be: YYYY-MM-DD!`)
});

export const generateToken = (user: IUserObject) => {
  const { password, ...userWithoutPassword } = user;

  return jwt.sign(userWithoutPassword, secret, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(256).toString('hex').slice(0, 100);
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new ResponseError(401, ['Unauthorized']));
  }

  const countToken = await prismaClient.accessToken.count({
    where: {
      token,
    },
  });


  if (!countToken) {
    return next(new ResponseError(401, ['Unauthorized']));
  }

  try {
    const decoded = jwt.verify(token, secret) as IUserObject;

    req.user = decoded;
    next();
  } catch (error) {
    return next(new ResponseError(401, ['Invalid Token']));
  }
};

export const validateLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await baseSchema.parse(req.body);

    next();
  } catch (e) {
    next(e);
  }
};

export const validateEditProfile = async(
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await editProfileSchema.parse(req.body);

    next();
  } catch (e) {
    next(e);
  }
}
