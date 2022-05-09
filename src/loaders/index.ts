import expressLoader from './express';
import sequelizeLoader from './sequelize';
import s3Loader from './s3';

export default async ({ expressApp }) => {
  await sequelizeLoader();
  await s3Loader();
  await expressLoader({ app: expressApp });
};
