import { NextFunction, Request, Response, Router } from 'express';
import { validate } from '../middlewares/validate';
import { body } from 'express-validator';
import { BankCtx } from '../../models/bankCtx';
import attachIntegration from '../middlewares/attachIntegration';
import BankContextService from '../../services/bankCtx';

const route = Router();

export default (app: Router) => {
  app.use('/integrations', route);

  route.post(
    '/set-context',
    attachIntegration,
    validate([
      body('contextId').custom((value, { req }) => {
        return BankCtx.findOne({ where: { id: value, integration_id: req.integration.id } }).then((bankCtx) => {
          return bankCtx ? bankCtx : Promise.reject('bank-context-not-found');
        });
      }),
      body('payload'),
      body('externalId'),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { contextId, payload, externalId } = req.body;

        const service = new BankContextService();
        await service.Update(contextId, req.integration.id, JSON.stringify(payload), externalId);

        return res.send({ status: 'ok' });
      } catch (e) {
        return next(e);
      }
    },
  );

  route.post(
    '/get-context',
    attachIntegration,
    validate([
      body('contextId').custom((value, { req }) => {
        return BankCtx.findOne({ where: { id: value, integration_id: req.integration.id } }).then((bankCtx) => {
          return bankCtx ? bankCtx : Promise.reject('bank-context-not-found');
        });
      }),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { contextId } = req.body;

        const service = new BankContextService();
        const { bankCtx } = await service.GetContext(contextId);

        return res.json({ status: 'ok', data: JSON.parse(bankCtx.payload) });
      } catch (e) {
        return next(e);
      }
    },
  );
};
