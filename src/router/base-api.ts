import express from 'express';
import { AuthController } from '../controller/auth-controller';
import { validateLogin, verifyToken } from '../validation/auth-validation';

export const baseRouter = express.Router();

// LOGIN
baseRouter.post('/login', validateLogin, AuthController.login);
baseRouter.post('/refresh-token', AuthController.refreshToken);
baseRouter.get('/profile', verifyToken, AuthController.profile);
baseRouter.post('/logout', verifyToken, AuthController.logout);
