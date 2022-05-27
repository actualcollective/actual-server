import { Router, Request, Response, NextFunction } from 'express';
import isAuth from '../middlewares/isAuth';
import attachCurrentUser from '../middlewares/attachCurrentUser';
import WebTokenService from '../../services/token';
import attachWebToken from '../middlewares/attachWebToken';
import { validate } from '../middlewares/validate';
import { body } from 'express-validator';
import { BankCtx } from '../../models/bankCtx';
import BankContextService from '../../services/bankCtx';

const route = Router();

export default (app: Router) => {
  app.use('/plaid', route);

  route.post(
    '/create-web-token',
    isAuth,
    attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const service = new WebTokenService();
        const { token } = await service.Create(req.currentUser.id);

        return res.send({ status: 'ok', data: token });
      } catch (e) {
        return next(e);
      }
    },
  );

  route.post('/validate-web-token', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data } = req.body;

      const service = new WebTokenService();
      const { token } = await service.Validate(data);

      return res.send({ status: 'ok', data: { token: token } });
    } catch (e) {
      return next(e);
    }
  });

  route.post('/put-web-token-contents', attachWebToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data } = req.body;
      console.log(data);
      const service = new WebTokenService();
      const { token } = await service.Update(req.webToken.id, null, { content: JSON.stringify(data) });

      return res.send({ status: 'ok', data: { token: token } });
    } catch (e) {
      return next(e);
    }
  });

  route.post('/get-web-token-contents', attachWebToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = new WebTokenService();
      const { token } = await service.GetToken(req.webToken.id);

      return res.send({ status: 'ok', data: JSON.parse(token.content) });
    } catch (e) {
      return next(e);
    }
  });

  route.post(
    '/handoff_public_token',
    validate([
      body('public_token').custom((value) => {
        return BankCtx.findOne({ where: { external_id: value } }).then((bankCtx) => {
          return bankCtx ? bankCtx : Promise.reject('bank-context-not-found');
        });
      }),
    ]),
    isAuth,
    attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // we don't do much here, simply returning the bankCtx id that corresponds with the public token
        const { public_token } = req.body;
        const service = new BankContextService();
        const { bankCtx } = await service.GetContext(null, public_token);

        return res.send({ status: 'ok', data: bankCtx.id });
      } catch (e) {
        return next(e);
      }
    },
  );
};
