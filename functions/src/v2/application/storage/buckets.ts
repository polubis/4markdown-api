import * as admin from 'firebase-admin';
import { errors } from '../../libs/framework/errors';

const getDefaultBucket = async () => {
  const storage = admin.storage();
  const bucket = storage.bucket();
  const [bucketExists] = await bucket.exists();

  if (!bucketExists) {
    throw errors.internal(
      `Cannot find default bucket. Please go to Firebase console and create bucket.`,
    );
  }

  return bucket;
};

const createDefaultBucketDownloadURL = ({
  name,
  location,
}: {
  name: string;
  location: string;
}): string =>
  `https://firebasestorage.googleapis.com/v0/b/${name}/o/${encodeURIComponent(
    location,
  )}?alt=media`;

type DefaultBucket = Awaited<ReturnType<typeof getDefaultBucket>>;

const defaultBucketFolders = {
  images: `images`,
};

export type { DefaultBucket };
export {
  getDefaultBucket,
  createDefaultBucketDownloadURL,
  defaultBucketFolders,
};
