import { Request } from 'express';
import Proto, { MessageEnvelope, SyncRequest } from '../util/proto/sync_pb';
import FileService from './file';
import { FileModel } from '../models/file';
import { MessageBinary, MessageBinaryModel } from '../models/messageBinary';
import { MessageMerkle, MessageMerkleModel } from '../models/messageMerkle';
import { db } from '../loaders/sequelize';
import { Buffer } from 'buffer';
import * as merkleUtil from '../util/merkle';
import Timestamp from '../util/timestamp';
import { Op, UniqueConstraintError } from 'sequelize';
import ActualError from '../exceptions/actual';

export default class SyncService {
  // This is a version representing the internal format of sync
  // messages. When this changes, all sync files need to be reset. We
  // will check this version when syncing and notify the user if they
  // need to reset.
  // -- copied from original implementation
  public SYNC_FORMAT_VERSION = 2;

  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();
  }

  private async getOrCreateMerkle(userId: string, groupId: string): Promise<MessageMerkleModel> {
    let merkle = await MessageMerkle.findOne({ where: { user_id: userId, group_id: groupId } });

    if (merkle === null) {
      merkle = await MessageMerkle.create({ user_id: userId, group_id: groupId, merkle: JSON.stringify({}) });
    }

    return merkle;
  }

  private async syncMessages(
    userId: string,
    groupId: string,
    messages: MessageEnvelope[],
    since: string,
  ): Promise<{ merkleContent: object; newMessages: MessageBinaryModel[] }> {
    const newMessages = await MessageBinary.findAll({
      where: { user_id: userId, group_id: groupId, timestamp: { [Op.gt]: since } },
      order: ['timestamp'],
    });

    let merkleContent = null;
    const tx = await db.transaction();

    try {
      const merkle = await this.getOrCreateMerkle(userId, groupId);
      merkleContent = JSON.parse(merkle.merkle);

      if (messages.length !== 0) {
        for (const message of messages) {
          try {
            await MessageBinary.create({
              user_id: userId,
              group_id: groupId,
              timestamp: message.getTimestamp(),
              is_encrypted: message.getIsencrypted(),
              content: Buffer.from(message.getContent_asU8()),
            });
          } catch (e) {
            if (e instanceof UniqueConstraintError) {
              continue;
            }
            throw e;
          }

          merkleContent = merkleUtil.insert(merkleContent, Timestamp.parse(message.getTimestamp()));
        }
      }

      merkleContent = merkleUtil.prune(merkleContent);

      merkle.merkle = JSON.stringify(merkleContent);
      await merkle.save();

      await tx.commit();
    } catch (e) {
      await tx.rollback();
    }

    return { merkleContent, newMessages };
  }

  public async Sync(req: Request): Promise<unknown> {
    let protoReq: null | SyncRequest = null;
    let file: null | FileModel = null;

    try {
      protoReq = Proto.SyncRequest.deserializeBinary(req.body);
    } catch (e) {
      throw new ActualError('internal-error');
    }

    try {
      const result = await this.fileService.GetFile(protoReq.getFileid(), req.currentUser.id);
      file = result.file;
    } catch (e) {
      throw new ActualError('file-not-found');
    }

    if (file.sync_version === null || file.sync_version < this.SYNC_FORMAT_VERSION) {
      throw new ActualError('file-old-version');
    }

    // When resetting sync state, something went wrong. There is no
    // group id and it's awaiting a file to be uploaded.
    // -- copied from original implementation
    if (file.group_id === null) {
      throw new ActualError('file-needs-upload');
    }

    // The changes being synced are part of an old group, which
    // means the file has been reset. User needs to re-download.
    // -- copied from original implementation
    if (file.group_id !== protoReq.getGroupid()) {
      throw new ActualError('file-has-reset');
    }

    // Check to make sure the uploaded file is valid and has been
    // encrypted with the same key it is registered with (this might
    // be wrong if there was an error during the key creation
    // process)
    // -- copied from original implementation
    const uploadedKeyId = file.encrypt_meta ? JSON.parse(file.encrypt_meta).keyId : null;

    if (uploadedKeyId !== file.encrypt_key_id) {
      throw new ActualError('file-key-mismatch');
    }

    // The data is encrypted with a different key which is
    // unacceptable. We can't accept these changes. Reject them and
    // tell the user that they need to generate the correct key
    // (which necessitates a sync reset so they need to re-download).
    // -- copied from original implementation
    if (protoReq.getKeyid() && file.encrypt_key_id !== protoReq.getKeyid()) {
      throw new ActualError('file-has-new-key');
    }

    const { merkleContent, newMessages } = await this.syncMessages(
      req.currentUser.id,
      file.group_id,
      protoReq.getMessagesList(),
      protoReq.getSince(),
    );

    const protoRes = new Proto.SyncResponse();
    protoRes.setMerkle(JSON.stringify(merkleContent));

    for (const binary of newMessages) {
      const message = new MessageEnvelope();
      message.setTimestamp(binary.timestamp);
      message.setIsencrypted(binary.is_encrypted);
      message.setContent(binary.content);
      protoRes.addMessages(message);
    }

    return Buffer.from(protoRes.serializeBinary());
  }
}
