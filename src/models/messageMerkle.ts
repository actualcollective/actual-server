import * as Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';
import { db } from '../loaders/sequelize';

const attributes: SequelizeAttributes<MessageMerkleAttributes> = {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  user_id: { type: DataTypes.UUID, allowNull: false },
  group_id: { type: DataTypes.UUID, allowNull: false },
  merkle: { type: DataTypes.TEXT },
};

export type MessageMerkleModel = Sequelize.Model<MessageMerkleAttributes> & MessageMerkleAttributes;

export const MessageMerkle = db.define<MessageMerkleModel, MessageMerkleAttributes>('MessageMerkle', attributes);

export interface MessageMerkleAttributes {
  id?: string;
  user_id: string;
  group_id: string;
  merkle: string;
}
