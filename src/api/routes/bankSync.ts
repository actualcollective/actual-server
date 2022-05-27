import { Request, Response, NextFunction, Router } from 'express';
import isAuth from '../middlewares/isAuth';
import attachCurrentUser from '../middlewares/attachCurrentUser';
import { validate } from '../middlewares/validate';
import { body } from 'express-validator';
import { BankCtx } from '../../models/bankCtx';
import BankSyncService from '../../services/bankSync';

const route = Router();

export default (app: Router) => {
  app.use('/plaid', route);

  route.post(
    '/accounts',
    isAuth,
    attachCurrentUser,
    validate([
      body('bankId').custom((value, { req }) => {
        return BankCtx.findOne({ where: { id: value, user_id: req.currentUser.id } }).then((bankCtx) => {
          return bankCtx ? bankCtx : Promise.reject('bank-context-not-found');
        });
      }),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { bankId } = req.body;

        const service = new BankSyncService();
        const { accounts } = await service.GetAccounts(bankId);

        return res.send({ status: 'ok', data: { accounts } });
      } catch (e) {
        next(e);
      }
    },
  );

  route.post(
    '/transactions',
    isAuth,
    attachCurrentUser,
    validate([
      body('bankId').custom((value, { req }) => {
        return BankCtx.findOne({ where: { id: value, user_id: req.currentUser.id } }).then((bankCtx) => {
          return bankCtx ? bankCtx : Promise.reject('bank-context-not-found');
        });
      }),
      body('account_id'),
      body('start_date'),
      body('end_date'),
      body('count'),
      body('offset'),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { bankId, account_id, start_date, end_date, count, offset } = req.body;

        const service = new BankSyncService();
        const data = await service.GetTransactions(bankId, start_date, end_date, account_id, count, offset);

        return res.send({ status: 'ok', data: data });
      } catch (e) {
        next(e);
      }
    },
  );
};
