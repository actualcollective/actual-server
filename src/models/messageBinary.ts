import * as Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';
import { db } from '../loaders/sequelize';

const attributes: SequelizeAttributes<MessageBinaryAttributes> = {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  user_id: { type: DataTypes.UUID, allowNull: false },
  group_id: { type: DataTypes.UUID, allowNull: false },
  is_encrypted: { type: DataTypes.BOOLEAN },
  content: { type: DataTypes.BLOB },
  timestamp: { type: DataTypes.STRING, unique: true },
};

export type MessageBinaryModel = Sequelize.Model<MessageBinaryAttributes> & MessageBinaryAttributes;

export const MessageBinary = db.define<MessageBinaryModel, MessageBinaryAttributes>('MessageBinary', attributes);

export interface MessageBinaryAttributes {
  id?: string;
  user_id: string;
  group_id: string;
  is_encrypted: boolean;
  content: string;
  timestamp: string;
}
