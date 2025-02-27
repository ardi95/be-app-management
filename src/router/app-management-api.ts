import express from 'express';
import { validateResetPasswordUser, validateStoreUser, validateUpdateUser } from '../validation/user-validation';
import { UserController } from '../controller/user-controller';

export const appManagementRouter = express.Router();

// USER
appManagementRouter.get('/user', UserController.index);
appManagementRouter.get('/user/:id', UserController.detail);
appManagementRouter.post('/user', validateStoreUser, UserController.store);
appManagementRouter.patch('/user/:id', validateUpdateUser, UserController.update);
appManagementRouter.post('/user/reset-password/:id', validateResetPasswordUser, UserController.resetPassword);
