import { https, logger } from 'firebase-functions';

import { errors } from '../core/errors';
import { UploadImagePayload } from '../payloads/docs.payload';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import { IMAGES_BUCKET } from '../core';

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
        throw errors.invalidArg(`Provided resource is not a base64 format`);
      }

      const binaryImage = Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ``),
        `base64`,
      );

      const bucket = admin.storage().bucket(IMAGES_BUCKET);
      const [bucketExists] = await bucket.exists();

      if (!bucketExists) {
        throw errors.internal();
      }

      const ref = admin.storage().bucket().file(`${uuid()}.png`);

      await ref.save(binaryImage, { contentType: `image/png` });
    } catch (err) {
      logger.info(err);
      throw errors.internal();
    }
  },
};
