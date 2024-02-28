import { https, logger } from 'firebase-functions';

import { errors } from '../core/errors';
import { UploadImagePayload } from '../payloads/docs.payload';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';

const isValidImage = (data: Buffer): boolean => {
  const jpeg = `ffd8ffe0`;
  const png = `89504e47`;
  const prefix = data.toString(`hex`, 0, 4);

  return prefix === jpeg || prefix === png;
};

export const UsersService = {
  uploadImage: async (
    context: https.CallableContext,
    payload: UploadImagePayload,
  ): Promise<void> => {
    try {
      const auth = context.auth;

      if (!auth) {
        throw errors.notAuthorized();
      }

      const { image } = payload;

      if (typeof image !== `string`) {
        throw errors.invalidArg(`Provided resource is not an image`);
      }

      const binaryImage = Buffer.from(image, `base64`);

      if (!isValidImage(binaryImage)) {
        throw errors.invalidArg(`Provided resource is not an image`);
      }

      const bucketUrl = process.env.IMAGES_BUCKET;

      if (!bucketUrl) {
        throw errors.internal();
      }

      const bucket = admin.storage().bucket(bucketUrl);
      const [bucketExists] = await bucket.exists();

      if (!bucketExists) {
        throw errors.internal();
      }

      const ref = admin.storage().bucket().file(`${auth.uid}/${uuid()}`);

      await ref.save(binaryImage);
    } catch (err) {
      logger.info(err);
      throw errors.internal();
    }
  },
};
