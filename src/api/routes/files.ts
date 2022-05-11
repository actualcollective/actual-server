import { NextFunction, Request, Response, Router } from 'express';
import isAuth from '../middlewares/isAuth';
import attachCurrentUser from '../middlewares/attachCurrentUser';
import FileObjectService from '../../services/fileObject';
import { validate } from '../middlewares/validate';
import { body, header } from 'express-validator';
import { File } from '../../models/file';
import FileService from '../../services/file';

const route = Router();

export default (app: Router) => {
  app.use('/sync', route);

  route.post(
    '/upload-user-file',
    isAuth,
    attachCurrentUser,
    validate([
      //header('x-actual-name'),
      // its possible that the file does not exist yet
      //header('x-actual-file-id'),
      //header('x-actual-group-id')
      //  .optional()
      //  .custom(value => {
      //    return User.findOne({ where: { id: value } }).then(user =>
      //      user ? user : Promise.reject('account-mismatch'),
      //    );
      //  }),
      //header('x-actual-encrypt-meta').optional,
      //header('x-actual-format').optional,
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const service = new FileObjectService();
        const groupId = await service.UploadFileObject(req);

        return res.send({ status: 'ok', groupId });
      } catch (e) {
        return next(e);
      }
    },
  );

  route.get(
    '/download-user-file',
    isAuth,
    attachCurrentUser,
    validate([
      //header('x-actual-file-id').custom((value, { req }) => {
      //  return File.findOne({ where: { id: value, user_id: req.currentUser.id } }).then(file => {
      //    return file ? file : Promise.reject('file-not-found');
      //  });
      //}),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const fileId = req.header('x-actual-file-id');

        const service = new FileObjectService();
        const buffer = await service.DownloadFileObject(req.header('x-actual-file-id'), req.currentUser.id);

        res.setHeader('Content-Disposition', `attachment;filename=${fileId}`);
        return res.send(buffer);
      } catch (e) {
        return next(e);
      }
    },
  );

  route.post(
    '/reset-user-file',
    isAuth,
    attachCurrentUser,
    validate([
      body('fileId').custom((value, { req }) => {
        return File.findOne({ where: { id: value, user_id: req.currentUser.id } }).then((file) => {
          return file ? file : Promise.reject('file-not-found');
        });
      }),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { fileId } = req.body;

        const service = new FileService();
        await service.ResetFile(fileId, req.currentUser.id, true);

        return res.send({ status: 'ok' });
      } catch (e) {
        return next(e);
      }
    },
  );

  route.post(
    '/delete-user-file',
    isAuth,
    attachCurrentUser,
    validate([
      body('fileId').custom((value, { req }) => {
        return File.findOne({ where: { id: value, user_id: req.currentUser.id } }).then((file) => {
          return file ? file : Promise.reject('file-not-found');
        });
      }),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { fileId } = req.body;

        const objService = new FileObjectService();
        await objService.DeleteFileObject(fileId, req.currentUser.id);

        const service = new FileService();
        await service.DeleteFile(fileId, req.currentUser.id, true);

        return res.send({ status: 'ok' });
      } catch (e) {
        return next(e);
      }
    },
  );

  route.post('/update-user-filename', (req: Request, res: Response) => {});

  route.get('/list-user-files', isAuth, attachCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = new FileService();
      const { files } = await service.GetFiles(req.currentUser.id);

      return res.send({
        status: 'ok',
        data: files.map((file) => ({
          deleted: false,
          fileId: file.id,
          groupId: file.group_id,
          name: file.name,
          encryptKeyId: file.encrypt_key_id,
        })),
      });
    } catch (e) {
      return next(e);
    }
  });

  route.get(
    '/get-user-file-info',
    isAuth,
    attachCurrentUser,
    validate([
      /*header('x-actual-file-id').custom((value, { req }) => {
        return File.findOne({ where: { id: value, user_id: req.currentUser.id } }).then(file => {
          return file ? file : Promise.reject('file-not-found');
        });
      }), */
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const service = new FileService();
        const { file } = await service.GetFile(req.header('x-actual-file-id'), req.currentUser.id);

        return res.send({
          status: 'ok',
          data: {
            deleted: false,
            fileId: file.id,
            groupId: file.group_id,
            name: file.name,
            encryptMeta: file.encrypt_meta ? JSON.parse(file.encrypt_meta) : null,
          },
        });
      } catch (e) {
        return next(e);
      }
    },
  );
};
