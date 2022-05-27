import { Router } from 'express';
import account from './routes/account';
import files from './routes/files';
import keys from './routes/keys';
import sync from './routes/sync';
import integration from './routes/integration';
import token from './routes/token';
import bankCtx from './routes/bankCtx';
import bankSync from './routes/bankSync';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  account(app);
  files(app);
  keys(app);
  sync(app);
  integration(app);
  token(app);
  bankCtx(app);
  bankSync(app);

  return app;
};
