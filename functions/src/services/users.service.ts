import { env } from '../core/env';
import { https } from 'firebase-functions';
import { errors } from '../core/errors';
import { UploadImagePayload } from '../payloads/docs.payload';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import { identified } from '../core/auth';

const UsersService = {
  uploadImage: async (
    payload: UploadImagePayload,
    context: https.CallableContext,
  ): Promise<void> => {
    identified(context);

    const { image } = payload;

    if (typeof image !== `string`) {
      throw errors.invalidArg(`Provided resource is not a base64 format`);
    }

    const binaryImage = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ``),
      `base64`,
    );

    const bucket = admin.storage().bucket(env(`IMAGES_BUCKET`));
    const [bucketExists] = await bucket.exists();

    if (!bucketExists) {
      throw errors.internal();
    }

    const ref = admin.storage().bucket().file(`${uuid()}.png`);

    await ref.save(binaryImage, { contentType: `image/png` });
  },
};

export { UsersService };
