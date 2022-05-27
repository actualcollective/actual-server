import { User } from '../../models/user';
import Logger from '../../loaders/logger';
import WebTokenService from '../../services/token';
import { WebTokenModel } from '../../models/token';

const attachWebToken = async (req, res, next) => {
  try {
    const webToken = req.body.token;

    if (!webToken) {
      return throwError(res);
    }

    let token: null | WebTokenModel = null;
    try {
      const service = new WebTokenService();
      const res = await service.Validate(webToken);
      token = res.token;
    } catch (e) {
      return throwError(res);
    }

    const user = await User.findOne({ where: { id: token.user_id } });
    if (user) {
      req.webToken = token;
      req.currentUser = user;
      return next();
    }

    return throwError(res);
  } catch (e) {
    Logger.error('Error attaching user to req: %o', e);
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

export default attachWebToken;
