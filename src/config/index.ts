import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (!envFound) {
  throw new Error("Couldn't find .env file!");
}

export default {
  port: parseInt(process.env.PORT, 10),
  hostname: '0.0.0.0',
  mode: 'development',
  databaseURL: process.env.POSTGRES_URI,
  jwtSecret: process.env.JWT_SECRET,
  registrationCode: process.env.REGISTRATION_CODE,
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
    url: process.env.S3_ENDPOINT_URL,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
  },
};
