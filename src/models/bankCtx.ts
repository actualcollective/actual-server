import * as Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';
import { db } from '../loaders/sequelize';
import BaseAttributes from '../interfaces/baseAttributes';

const attributes: SequelizeAttributes<BankCtxAttributes> = {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  external_id: { type: DataTypes.STRING },
  integration_id: { type: DataTypes.STRING, allowNull: false },
  user_id: { type: DataTypes.STRING, allowNull: false },
  payload: { type: DataTypes.STRING },
};

export type BankCtxModel = Sequelize.Model<BankCtxAttributes> & BankCtxAttributes & BaseAttributes;

export const BankCtx = db.define<BankCtxModel, BankCtxAttributes>('BankCtx', attributes);

export interface BankCtxAttributes {
  id?: string;
  external_id: string;
  integration_id: string;
  user_id: string;
  payload: string;
}
