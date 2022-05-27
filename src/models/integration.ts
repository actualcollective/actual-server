import * as Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';
import { db } from '../loaders/sequelize';
import BaseAttributes from '../interfaces/baseAttributes';

const attributes: SequelizeAttributes<IntegrationAttributes> = {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  url: { type: DataTypes.STRING, allowNull: false },
  token: { type: DataTypes.STRING, allowNull: false },
};

export type IntegrationModel = Sequelize.Model<IntegrationAttributes> & IntegrationAttributes & BaseAttributes;

export const Integration = db.define<IntegrationModel, IntegrationAttributes>('Integration', attributes, {
  scopes: { withoutToken: { attributes: { exclude: ['token'] } } },
});

export interface IntegrationAttributes {
  id?: string;
  name: string;
  url: string;
  token: string;
}
