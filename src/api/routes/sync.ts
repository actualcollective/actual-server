import { NextFunction, Request, Response, Router } from 'express';
import isAuth from '../middlewares/isAuth';
import attachCurrentUser from '../middlewares/attachCurrentUser';
import SyncService from '../../services/sync';

const route = Router();

export default (app: Router) => {
  app.use('/sync', route);

  route.post('/sync', isAuth, attachCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = new SyncService();
      const buffer = await service.Sync(req);

      res.set('Content-Type', 'application/actual-sync');
      res.send(Buffer.from(buffer));
    } catch (e) {
      return next(e);
    }
  });
};
