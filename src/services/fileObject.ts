import FileService from './file';
import { Request } from 'express';
import { Delete, Download, Upload } from '../util/s3';
import { File } from '../models/file';
import { v4 as uuidv4 } from 'uuid';
import ActualError from '../exceptions/actual';

export default class FileObjectService {
  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();
  }

  private extractHeaders(req: Request): {
    name: string;
    fileId: string;
    groupId: string | null;
    encryptMeta: string | null;
    syncFormatVersion: number | null;
  } {
    return {
      name: decodeURIComponent(req.header('x-actual-name')),
      fileId: req.header('x-actual-file-id'),
      groupId: req.header('x-actual-group-id') || null,
      encryptMeta: req.header('x-actual-encrypt-meta') || null,
      syncFormatVersion: parseInt(req.header('x-actual-format')) || null,
    };
  }

  private buildObjectName(userId: string, fileId: string): string {
    return `${userId}-${fileId}.blob`;
  }

  public async DeleteFileObject(fileId: string, userId: string): Promise<void> {
    const { file } = await this.fileService.GetFile(fileId, userId);
    await Delete(this.buildObjectName(userId, file.id), 'files');
  }

  public async DownloadFileObject(fileId: string, userId: string): Promise<unknown> {
    const { file } = await this.fileService.GetFile(fileId, userId);
    return await Download(this.buildObjectName(userId, file.id), 'files');
  }

  public async UploadFileObject(req: Request): Promise<string | null> {
    // eslint-disable-next-line prefer-const
    let { name, fileId, groupId, encryptMeta, syncFormatVersion } = this.extractHeaders(req);
    const keyId = encryptMeta ? JSON.parse(encryptMeta)?.keyId : null;
    let file = null;

    try {
      const result = await this.fileService.GetFile(fileId, req.currentUser.id);
      file = result.file;
    } catch (e) {}

    if (file !== null) {
      if (req.currentUser.id !== file.user_id) {
        throw new ActualError('account-mismatch');
      }
      // The uploading file is part of an old group, so reject
      // it. All of its internal sync state is invalid because its
      // old. The sync state has been reset, so user needs to
      // either reset again or download from the current group.
      // -- copied from original implementation
      if (groupId !== file.group_id) {
        throw new ActualError('file-has-reset');
      }

      // The key that the file is encrypted with is different than
      // the current registered key. All data must always be
      // encrypted with the registered key for consistency. Key
      // changes always necessitate a sync reset, which means this
      // upload is trying to overwrite another reset. That might
      // be be fine, but since we definitely cannot accept a file
      // encrypted with the wrong key, we bail and suggest the
      // user download the latest file.
      // -- copied from original implementation
      if (keyId !== file.encrypt_key_id) {
        throw new ActualError('file-has-new-key');
      }
    }

    await Upload(req.body, this.buildObjectName(req.currentUser.id, fileId), 'files');

    if (file === null) {
      groupId = uuidv4();

      file = await File.create({
        id: fileId,
        name: name,
        user_id: req.currentUser.id,
        group_id: groupId,
        sync_version: syncFormatVersion,
        encrypt_meta: encryptMeta,
      });
    }

    // sync state was reset, create new group
    // -- copied from original implementation
    if (file.group_id === null) {
      groupId = uuidv4();
      await File.update({ group_id: groupId }, { where: { id: file.id, user_id: req.currentUser.id } });
    }

    await File.update(
      { sync_version: syncFormatVersion, encrypt_meta: encryptMeta, name: name },
      { where: { id: fileId, user_id: req.currentUser.id } },
    );

    return groupId;
  }
}
