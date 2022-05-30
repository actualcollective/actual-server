import config from '../../config';

const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } else if (req.header('x-actual-token')) {
    return req.header('x-actual-token');
  } else if (req.query && req.query.token) {
    return req.query.token;
  } else if (req.body && req.body.token) {
    return req.body.token;
  }

  return null;
};

const requireRegCode = (req, res, next) => {
  const token = getToken(req);

  if (token === config.registrationCode) {
    return next();
  }

  return res.status(401).send({
    status: 'error',
    reason: 'unauthorized',
    details: 'token-not-found',
  });
};

export default requireRegCode;
