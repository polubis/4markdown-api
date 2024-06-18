import * as admin from 'firebase-admin';
import { errors } from './errors';

const getBucket = async () => {
  const storage = admin.storage();
  const bucket = storage.bucket();

  if (!(await bucket.exists())) {
    throw errors.internal(`Cannot find bucket for avatars`);
  }

  return bucket;
};

export { getBucket };
