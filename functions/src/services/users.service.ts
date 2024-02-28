import { https, logger } from 'firebase-functions';

import { errors } from '../core/errors';
import { UploadImagePayload } from '../payloads/docs.payload';
import * as admin from 'firebase-admin';

export const UsersService = {
  uploadImage: async (
    context: https.CallableContext,
    payload: UploadImagePayload,
  ): Promise<void> => {
    logger.info(payload);

    try {
      const auth = context.auth;

      if (!auth) {
        throw errors.notAuthorized();
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
    } catch (err) {
      throw errors.internal();
    }
  },
};
