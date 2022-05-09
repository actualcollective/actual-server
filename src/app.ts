import config from './config';

import express from 'express';

import Logger from './loaders/logger';

async function startServer() {
  const app = express();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await require('./loaders').default({ expressApp: app });

  app.listen(config.port, config.hostname, () => {
    Logger.info(`Server listening on: ${config.hostname}:${config.port}`);
  });
}

startServer();
