import {
  DeleteObjectOutput,
  DeleteObjectRequest,
  ObjectCannedACL,
  PutObjectOutput,
  PutObjectRequest,
  S3,
} from '@aws-sdk/client-s3';
import { make } from '../loaders/s3';
import config from '../config';

export async function Download(objectName: string, path: string | null = null): Promise<unknown> {
  const s3: S3 = make(path);

  const streamTo = (stream) =>
    new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });

  const data = await s3.getObject({ Bucket: config.s3.bucket, Key: objectName });

  return await streamTo(data.Body);
}

export async function Upload(
  file: any,
  objectName: string,
  path: string | null = null,
  mimeType: string | null = 'binary',
  acl: ObjectCannedACL | string | null = 'private',
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const s3: S3 = make(path);
    const bucket = config.s3.bucket;

    const params: PutObjectRequest = {
      Bucket: bucket,
      Key: objectName,
      Body: file,
      ACL: acl,
      ContentType: mimeType,
    };
    s3.putObject(params, (err, data: PutObjectOutput) => {
      if (err) reject(err);
      resolve(`${config.s3.url}${bucket}/${path}/${objectName}`);
    });
  });
}

export async function Delete(objectName: string, path: string | null = null): Promise<DeleteObjectOutput> {
  return new Promise<DeleteObjectOutput>((resolve, reject) => {
    const s3: S3 = make(path);
    const bucket = config.s3.bucket;

    const params: DeleteObjectRequest = { Bucket: bucket, Key: objectName };
    s3.deleteObject(params, (err, data: DeleteObjectOutput) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}
