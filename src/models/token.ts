import * as Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';
import { db } from '../loaders/sequelize';
import BaseAttributes from '../interfaces/baseAttributes';

const attributes: SequelizeAttributes<WebTokenAttributes> = {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  user_id: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.STRING },
};

export type WebTokenModel = Sequelize.Model<WebTokenAttributes> & WebTokenAttributes & BaseAttributes;

export const WebToken = db.define<WebTokenModel, WebTokenAttributes>('WebToken', attributes);

export interface WebTokenAttributes {
  id?: string;
  user_id: string;
  content: string;
}
