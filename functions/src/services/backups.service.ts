import { BackupPayload, IBackupPayload } from '../payloads/backup.payload';
import { errors } from '../core/errors';
import { firestore, storage } from 'firebase-admin';
import { z } from 'zod';
import { CopyResponse } from '@google-cloud/storage';
import { logger } from 'firebase-functions/v1';

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

type DatabaseData = Record<string, Record<string, unknown>>;

const getDatabase = async (): Promise<DatabaseData> => {
  const db = firestore();
  const collections = await db.listCollections();

  const data: DatabaseData = {};

  const promises: {
    collectionId: string;
    promise: Promise<firestore.QuerySnapshot<firestore.DocumentData>>;
  }[] = [];

  for (const collection of collections) {
    data[collection.id] = {};
    promises.push({
      collectionId: collection.id,
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

const createDatabaseBackup = async (
  backupId: string,
  buckets: BucketsPair,
): Promise<void> => {
  const data = await getDatabase();
  const file = buckets.backup.file(`${backupId}/db/data`);

  await file.save(JSON.stringify(data), {
    contentType: `application/json`,
  });
};

const createStorageBackup = async (
  backupId: string,
  buckets: BucketsPair,
): Promise<void> => {
  const [sourceFiles] = await buckets.source.getFiles();

  const copyPromises: Promise<CopyResponse>[] = [];

  for (const sourceFile of sourceFiles) {
    copyPromises.push(
      sourceFile.copy(
        buckets.backup.file(`${backupId}/storage/${sourceFile.name}`),
      ),
    );
  }

  await Promise.all(copyPromises);
};

const verifySetup = (payload: IBackupPayload): void | never => {
  const backupSetup = { token: process.env.BACKUP_TOKEN };

  if (!BackupPayload.is(backupSetup)) {
    throw errors.invalidArg(`Lack of token on server process`);
  }

  if (payload.token !== backupSetup.token) {
    throw errors.invalidArg(`Wrong token`);
  }
};

const getBucketsPair = async (): Promise<BucketsPair> => {
  const [sourceBucket, backupBucket] = await Promise.all([
    getSourceBucket(),
    getBackupBucket(),
  ]);

  const buckets: BucketsPair = {
    source: sourceBucket,
    backup: backupBucket,
  };

  return buckets;
};

const BackupsService = {
  create: async (payload: IBackupPayload): Promise<void> => {
    verifySetup(payload);

    const backupId = createBackupId();

    const buckets = await getBucketsPair();

    await Promise.all([
      createDatabaseBackup(backupId, buckets),
      createStorageBackup(backupId, buckets),
    ]);
  },
  use: async (payload: IBackupPayload): Promise<unknown> => {
    verifySetup(payload);

    const buckets = await getBucketsPair();

    const [files] = await buckets.backup.getFiles({
      prefix: ``,
      delimiter: `/`,
    });
    const topDirectories = new Set();

    files.forEach((file) => {
      logger.info(file.name);
      const parts = file.name.split(`/`);

      if (parts.length > 1 && parts[1] === `db`) {
        topDirectories.add(parts[0]);
      }
    });

    return topDirectories;
  },
};

export { BackupsService };
