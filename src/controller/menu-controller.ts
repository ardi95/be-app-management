import { NextFunction, Request, Response } from 'express';
import { ResponseError } from '../config/response-error';
import { MenuService } from '../service/menu-service';

export class MenuController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MenuService.index(parseInt(req.params.id));

      res.status(200).json({
        ...data,
      });
    } catch (e) {
      next(e);
    }
  }

  static async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MenuService.detail(parseInt(req.params.id));

      if (!data) {
        return next(new ResponseError(404, ['The role does not exist!']));
      }

      res.status(200).json({
        data,
      });
    } catch (e) {
      next(e);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new ResponseError(401, ['Unauthorized!']));
      }

      const data = await MenuService.store(req.body, req.user);

      res.status(200).json({
        message: 'Success to add data menu.',
        data,
      });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new ResponseError(401, ['Unauthorized!']));
      }

      const data = await MenuService.update(
        parseInt(req.params.id),
        req.body,
        req.user
      );

      res.status(200).json({
        message: 'Success to edit data menu.',
        data,
      });
    } catch (e) {
      next(e);
    }
  }

  static async sort(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new ResponseError(401, ['Unauthorized!']));
      }

      await MenuService.sort(
        req.body,
        req.user
      );

      res.status(200).json({
        message: 'Success to sort data menu.',
      });
    } catch (e) {
      next(e);
    }
  }
}
