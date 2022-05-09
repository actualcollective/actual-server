import { expressjwt } from 'express-jwt';
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

const isAuth = expressjwt({
  secret: config.jwtSecret,
  userProperty: 'token',
  getToken: getToken,
  algorithms: ['HS256'],
});

export default isAuth;
