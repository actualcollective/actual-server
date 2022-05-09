import { Router, Request, Response, NextFunction } from 'express';
import AuthService from '../../services/auth';
import { User, UserAttributes } from '../../models/user';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate';
import isAuth from '../middlewares/isAuth';
import attachCurrentUser from '../middlewares/attachCurrentUser';

const route = Router();

export default (app: Router) => {
  app.use('/account', route);

  route.post(
    '/signup',
    validate([
      body('username').custom((value) => {
        return User.findOne({ where: { username: value } }).then((user) =>
          !user ? user : Promise.reject('invalid-username'),
        );
      }),
      body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
      body('password').isLength({ min: 8 }).withMessage('invalid-password'),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.body.email == '') {
          req.body.email = null;
        }

        const service = new AuthService();
        const { token } = await service.SignUp(req.body as Partial<UserAttributes>);

        return res.send({ status: 'ok', data: { token } });
      } catch (e) {
        return next(e);
      }
    },
  );

  // to be fully compatible with the open-source version it might be an idea to work with "device tokens" instead of an
  // user pass combo. These could be generated on an external service after initial registration.
  route.post(
    '/login',
    validate([
      body('username').custom((value) => {
        return User.findOne({ where: { username: value } }).then((user) =>
          user ? user : Promise.reject('invalid-username'),
        );
      }),
      body('password').isLength({ min: 8 }).withMessage('invalid-password'),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { username, password } = req.body;
        const service = new AuthService();

        const { token } = await service.SignIn(username, password);

        return res.send({ status: 'ok', data: { token } });
      } catch (e) {
        return next(e);
      }
    },
  );

  route.post(
    '/change-password',
    isAuth,
    attachCurrentUser,
    validate([body('password').isLength({ min: 8 }).withMessage('invalid-password')]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { password } = req.body;
        const service = new AuthService();

        await service.ChangePassword(req.currentUser, password);

        return res.send({ status: 'ok', data: {} });
      } catch (e) {
        return next(e);
      }
    },
  );

  // originally used to bootstrap the instance, we will just keep it for compatibility reasons
  route.get('/needs-bootstrap', (req: Request, res: Response) => {
    return res.send({ status: 'ok', data: { bootstrapped: true } });
  });

  // the self-hosted version returns the validated state only without further information about the authenticated user.
  // However, to be able to show more info we expose the user here which might break compatibility for this endpoint
  route.get('/validate', isAuth, attachCurrentUser, (req: Request, res: Response) => {
    return res.send({ status: 'ok', data: { validated: true, user: req.currentUser } });
  });
};
