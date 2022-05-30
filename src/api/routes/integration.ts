import { NextFunction, Request, Response, Router } from 'express';
import { validate } from '../middlewares/validate';
import { body } from 'express-validator';
import { Integration } from '../../models/integration';
import IntegrationService from '../../services/integration';
import attachWebToken from '../middlewares/attachWebToken';
import requireRegCode from '../middlewares/requireRegCode';

const route = Router();

export default (app: Router) => {
  app.use('/integrations', route);

  route.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = new IntegrationService();
      const { integrations } = await service.GetIntegrations();

      return res.send({ status: 'ok', data: integrations });
    } catch (e) {
      return next(e);
    }
  });

  route.post('/install', attachWebToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, bankCtxId } = req.body;
      const service = new IntegrationService();
      const { url } = await service.Install(id, req.webToken.id, bankCtxId);

      return res.send({ status: 'ok', data: { url: url } });
    } catch (e) {
      return next(e);
    }
  });

  route.post(
    '/register',
    requireRegCode,
    validate([
      body('url'),
      body('name').custom((value) => {
        return Integration.findOne({ where: { name: value } }).then((integration) => {
          return integration ? Promise.reject('integration-already-exists') : integration;
        });
      }),
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { name, url } = req.body;
        const service = new IntegrationService();
        const { integration } = await service.Create(name, url);

        return res.send({
          status: 'ok',
          data: { integration: integration },
        });
      } catch (e) {
        return next(e);
      }
    },
  );
};
