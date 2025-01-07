import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET,
} from '../config/env';

export const uploadImage = (fieldName: string) => {
  const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  const upload = multer({
    storage: multerS3({
      s3,
      bucket: AWS_S3_BUCKET,
      acl: 'public-read',
      key: (req, file, cb) => {
        cb(null, `profiles/${Date.now()}_${file.originalname}`);
      },
      metadata: (req, file, cb) => {
        cb(null, { fieldname: file.fieldname });
      },
    }),
  });

  return upload.single(fieldName);
};
