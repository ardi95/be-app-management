import express from 'express';
import { validateResetPasswordUser, validateStoreUser, validateUpdateUser } from '../validation/user-validation';
import { UserController } from '../controller/user-controller';
import { validateDeleteRole, validateStoreRole, validateUpdateRole } from '../validation/role-validation';
import { RoleController } from '../controller/role-controller';
import { MenuController } from '../controller/menu-controller';
import { validateSortMenu, validateStoreMenu, validateUpdateMenu } from '../validation/menu-validation';

export const appManagementRouter = express.Router();

// USER
appManagementRouter.get('/user', UserController.index);
appManagementRouter.get('/user/:id', UserController.detail);
appManagementRouter.post('/user', validateStoreUser, UserController.store);
appManagementRouter.patch('/user/:id', validateUpdateUser, UserController.update);
appManagementRouter.post('/user/reset-password/:id', validateResetPasswordUser, UserController.resetPassword);
appManagementRouter.post('/user/take-out/:id', validateResetPasswordUser, UserController.takeOut);

// ROLE
appManagementRouter.get('/role', RoleController.index);
appManagementRouter.get('/role/:id', RoleController.detail);
appManagementRouter.post('/role', validateStoreRole, RoleController.store);
appManagementRouter.patch('/role/:id', validateUpdateRole, RoleController.update);
appManagementRouter.delete('/role/:id', validateDeleteRole, RoleController.destroy);

// MENU
appManagementRouter.get('/menu/:id', MenuController.index);
appManagementRouter.get('/menu/:id/detail', MenuController.detail);
appManagementRouter.post('/menu', validateStoreMenu, MenuController.store);
appManagementRouter.post('/menu/:id/sort', validateSortMenu, MenuController.sort);
appManagementRouter.patch('/menu/:id', validateUpdateMenu, MenuController.update);
