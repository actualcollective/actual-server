import * as Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';
import { db } from '../loaders/sequelize';
import BaseAttributes from '../interfaces/baseAttributes';

const attributes: SequelizeAttributes<FileAttributes> = {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  user_id: { type: DataTypes.UUID, allowNull: false },
  group_id: { type: DataTypes.UUID },
  sync_version: { type: DataTypes.INTEGER },
  encrypt_meta: { type: DataTypes.TEXT },
  encrypt_key_id: { type: DataTypes.TEXT },
  encrypt_salt: { type: DataTypes.TEXT },
  encrypt_test: { type: DataTypes.TEXT },
  deleted: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
  name: { type: DataTypes.STRING },
};

export type FileModel = Sequelize.Model<FileAttributes> & FileAttributes & BaseAttributes;

export const File = db.define<FileModel, FileAttributes>('File', attributes);

export interface FileAttributes {
  id?: string;
  user_id: string;
  group_id?: string;
  sync_version: number;
  encrypt_meta: string;
  encrypt_key_id: string;
  encrypt_salt: string;
  encrypt_test: string;
  deleted: boolean;
  name: string;
}

export interface FileKeyCreateAttributes {
  fileId: string;
  keyId: string;
  keySalt: string;
  testContent: string;
}
