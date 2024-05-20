import { BackupPayload, IBackupPayload } from '../payloads/backup.payload';
import { errors } from '../core/errors';
import { firestore, storage } from 'firebase-admin';
import { z } from 'zod';
import { CopyResponse } from '@google-cloud/storage';

type Bucket = ReturnType<ReturnType<typeof storage>['bucket']>;
type BucketsPair = {
  source: Bucket;
  backup: Bucket;
};

const createBackupId = (): string => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, `0`);
  const month = String(date.getMonth() + 1).padStart(2, `0`);
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, `0`);
  const minutes = String(date.getMinutes()).padStart(2, `0`);
  const seconds = String(date.getSeconds()).padStart(2, `0`);

  return `${day}:${month}:${year}-${hours}:${minutes}:${seconds}`;
};

const COLLECTION_IDS = [`docs`, `images`, `users-profiles`] as const;
const collectionIdSchema = z.enum(COLLECTION_IDS);

type CollectionId = z.infer<typeof collectionIdSchema>;

type DatabaseData = Record<CollectionId, Record<string, unknown>>;

const getDatabase = async (): Promise<DatabaseData> => {
  const db = firestore();
  const collections = await db.listCollections();

  const data = COLLECTION_IDS.reduce<DatabaseData>(
    (acc, id) => ({
      ...acc,
      [id]: {},
    }),
    {} as DatabaseData,
  );

  const promises: {
    collectionId: CollectionId;
    promise: Promise<firestore.QuerySnapshot<firestore.DocumentData>>;
  }[] = [];

  for (const collection of collections) {
    promises.push({
      collectionId: collectionIdSchema.parse(collection.id),
      promise: collection.get(),
    });
  }

  const responses = await Promise.all(promises.map(({ promise }) => promise));

  responses.forEach(({ docs }, idx) => {
    const { collectionId } = promises[idx];

    docs.forEach((doc) => {
      data[collectionId][doc.id] = doc.data();
    });
  });

  return data;
};

const getSourceBucket = async (): Promise<Bucket> => {
  const bucket = storage().bucket();
  const [exists] = await bucket.exists();

  if (!exists) {
    throw errors.invalidArg(`There is no bucket for backups`);
  }

  return bucket;
};

const getBackupBucket = async (): Promise<Bucket> => {
  const bucket = storage().bucket(
    z.string().parse(process.env.BACKUP_BUCKET_NAME),
  );
  const [exists] = await bucket.exists();

  if (!exists) {
    throw errors.invalidArg(`There is no bucket for backups`);
  }

  return bucket;
};

const createDatabaseBackup = async (buckets: BucketsPair): Promise<void> => {
  const data = await getDatabase();
  const file = buckets.backup.file(`${createBackupId()}/db`);

  await file.save(JSON.stringify(data), {
    contentType: `application/json`,
  });
};

const createStorageBackup = async (buckets: BucketsPair): Promise<void> => {
  const [files] = await buckets.source.getFiles();

  const copyPromises: Promise<CopyResponse>[] = [];

  for (const file of files) {
    copyPromises.push(file.copy(buckets.backup.file(file.name)));
  }

  await Promise.all(copyPromises);
};

const BackupsService = {
  create: async (payload: IBackupPayload): Promise<void> => {
    const backupSetup = { token: process.env.BACKUP_TOKEN };

    if (!BackupPayload.is(backupSetup)) {
      throw errors.invalidArg(`Lack of token on server process`);
    }

    if (payload.token !== backupSetup.token) {
      throw errors.invalidArg(`Wrong token`);
    }

    const [sourceBucket, backupBucket] = await Promise.all([
      getSourceBucket(),
      getBackupBucket(),
    ]);

    const buckets: BucketsPair = {
      source: sourceBucket,
      backup: backupBucket,
    };

    await Promise.all([
      createDatabaseBackup(buckets),
      createStorageBackup(buckets),
    ]);
  },
};

export { BackupsService };
