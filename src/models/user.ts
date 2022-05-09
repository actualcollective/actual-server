import * as Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';
import { db } from '../loaders/sequelize';

const attributes: SequelizeAttributes<UserAttributes> = {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING, allowNull: false },
  salt: { type: DataTypes.STRING, allowNull: false },
};

export type UserModel = Sequelize.Model<UserAttributes> & UserAttributes;

export const User = db.define<UserModel, UserAttributes>('User', attributes, {
  defaultScope: { attributes: { exclude: ['password', 'salt'] } },
});

export interface UserAttributes {
  id?: string;
  username: string;
  email?: string;
  password: string;
  salt: string;
}
