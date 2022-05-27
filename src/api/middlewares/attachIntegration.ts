import Logger from '../../loaders/logger';
import { IntegrationModel } from '../../models/integration';
import IntegrationService from '../../services/integration';

const attachIntegration = async (req, res, next) => {
  try {
    const secret = req.body.token;

    if (!secret) {
      return throwError(res);
    }

    let integration: null | IntegrationModel = null;
    try {
      const service = new IntegrationService();
      const res = await service.GetIntegration(null, secret);
      integration = res.integration;
    } catch (e) {
      return throwError(res);
    }

    if (integration) {
      req.integration = integration;
      return next();
    }

    return throwError(res);
  } catch (e) {
    Logger.error('Error attaching integration to req: %o', e);
    return next(e);
  }
};

const throwError = (res) => {
  return res.status(401).send({
    status: 'error',
    reason: 'unauthorized',
    details: 'token-not-found',
  });
};

export default attachIntegration;
