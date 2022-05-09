import config from '../config';
import { Sequelize } from 'sequelize';
import Logger from './logger';

export const db = new Sequelize(config.databaseURL, { logging: msg => Logger.debug(msg) });

export default async (): Promise<Sequelize> => {
  await db.authenticate();
  return db;
};
