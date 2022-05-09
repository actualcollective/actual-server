import { File, FileAttributes, FileKeyCreateAttributes, FileModel } from '../models/file';
import { FindOptions, UpdateOptions } from 'sequelize';
import { MessageMerkle } from '../models/messageMerkle';
import { MessageBinary } from '../models/messageBinary';

export default class FileService {
  public async GetFiles(userId?: string): Promise<{ files: FileModel[] }> {
    const options: FindOptions<FileAttributes> = { where: { user_id: userId } };

    const files = await File.findAll(options);

    return { files };
  }

  public async GetFile(id: string, userId?: string | null): Promise<{ file: FileModel }> {
    const options: FindOptions<FileAttributes> = { where: { id: id } };

    if (userId) {
      options.where = { ...options.where, user_id: userId };
    }

    const file = await File.findOne(options);

    if (!file) {
      throw Error(`File with id ${id} does not exist.`);
    }

    return { file };
  }

  public async DeleteFile(id: string, userId?: string | null, withAssocs = false): Promise<{ file: FileModel }> {
    const { file } = await this.GetFile(id, userId);

    if (withAssocs) {
      await MessageMerkle.destroy({ where: { group_id: file.group_id } });
      await MessageBinary.destroy({ where: { group_id: file.group_id } });
    }

    await file.destroy();

    return { file };
  }

  public async ResetFile(id: string, userId?: string | null, withAssocs = false): Promise<{ file: FileModel }> {
    const { file } = await this.GetFile(id, userId);

    if (withAssocs) {
      await MessageMerkle.destroy({ where: { group_id: file.group_id } });
      await MessageBinary.destroy({ where: { group_id: file.group_id } });
    }

    file.group_id = null;
    await file.save();

    return { file };
  }

  public async UpdateFileKey(
    input: FileKeyCreateAttributes,
    userId?: string | null,
  ): Promise<{ affectedCount: number }> {
    const options: UpdateOptions<FileAttributes> = { where: { id: input.fileId } };

    if (userId) {
      options.where = { ...options.where, user_id: userId };
    }

    const [affectedCount] = await File.update(
      { encrypt_key_id: input.keyId, encrypt_salt: input.keySalt, encrypt_test: input.testContent },
      options,
    );

    if (affectedCount === 0) {
      throw Error(`Update was unsuccessful for file with id ${input.fileId}. no rows affected.`);
    }

    return { affectedCount };
  }
}
