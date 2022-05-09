import { Router } from 'express';
import account from './routes/account';
import files from './routes/files';
import keys from './routes/keys';
import sync from './routes/sync';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  account(app);
  files(app);
  keys(app);
  sync(app);

  return app;
};
