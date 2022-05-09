import { NextFunction, Request, Response, Router } from 'express';
import isAuth from '../middlewares/isAuth';
import attachCurrentUser from '../middlewares/attachCurrentUser';
import { validate } from '../middlewares/validate';
import { body } from 'express-validator';
import { File, FileKeyCreateAttributes } from '../../models/file';
import FileService from '../../services/file';

const route = Router();

export default (app: Router) => {
  app.use('/sync', route);

  route.post(
    '/user-get-key',
    isAuth,
    attachCurrentUser,
    validate([
      body('fileId').custom((value, { req }) => {
        return File.findOne({ where: { id: value, user_id: req.currentUser.id } }).then(file => {
          return file ? file : Promise.reject('file-not-found');
        });
      }),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { fileId } = req.body;
        const service = new FileService();

        // seems to be an anti-pattern to select the encryption details from a random file. Might be wise to
        // move them to the user or a new object
        const { file } = await service.GetFile(fileId, req.currentUser.id);

        return res.send({
          status: 'ok',
          data: { id: file.encrypt_key_id, salt: file.encrypt_salt, test: file.encrypt_test },
        });
      } catch (e) {
        return next(e);
      }
    },
  );

  route.post(
    '/user-create-key',
    isAuth,
    attachCurrentUser,
    validate([
      body('fileId').custom((value, { req }) => {
        return File.findOne({ where: { id: value, user_id: req.currentUser.id } }).then(file => {
          return file ? file : Promise.reject('file-not-found');
        });
      }),
      body('keyId'),
      body('keySalt'),
      body('testContent'),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const service = new FileService();
        await service.UpdateFileKey(req.body as FileKeyCreateAttributes, req.currentUser.id);

        res.send({ status: 'ok' });
      } catch (e) {
        return next(e);
      }
    },
  );
};
