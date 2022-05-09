import { S3 } from '@aws-sdk/client-s3';
import config from '../config';

export const make = (path: string | null = '') => {
  return new S3({
    apiVersion: 'latest',
    endpoint: `${config.s3.url}/${path}`,
    credentials: config.s3.credentials,
    region: config.s3.region,
  });
};

export default () => {
  // do preflight
  return make();
};
