import { User } from '../../models/user';
import Logger from '../../loaders/logger';

const attachCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.auth.id } });
    if (user) {
      req.currentUser = user;
      return next();
    }

    return res.status(401).send({
      status: 'error',
      reason: 'unauthorized',
      details: 'token-not-found',
    });
  } catch (e) {
    Logger.error('Error attaching user to req: %o', e);
    return next(e);
  }
};

export default attachCurrentUser;
