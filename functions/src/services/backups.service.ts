import {
  CreateBackupPayload,
  ICreateBackupPayload,
  IUseBackupPayload,
} from '../payloads/backup.payload';
import { errors } from '../core/errors';
import { firestore, storage } from 'firebase-admin';
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

type DatabaseData = Record<string, Record<string, unknown>>;

const getDatabase = async (): Promise<DatabaseData> => {
  const db = firestore();
  const collections = await db.listCollections();

  const databaseData: DatabaseData = {};

  const promises: {
    collectionId: string;
    promise: Promise<firestore.QuerySnapshot<firestore.DocumentData>>;
  }[] = [];

  for (const collection of collections) {
    databaseData[collection.id] = {};
    promises.push({
      collectionId: collection.id,
      promise: collection.get(),
    });
  }

  const responses = await Promise.all(promises.map(({ promise }) => promise));

  responses.forEach(({ docs }, idx) => {
    const { collectionId } = promises[idx];

    docs.forEach((doc) => {
      databaseData[collectionId][doc.id] = doc.data();
    });
  });

  return databaseData;
};

const getSourceBucket = async (): Promise<Bucket> => {
  const bucket = storage().bucket();
  const [exists] = await bucket.exists();

  if (!exists) {
    throw errors.invalidArg(`There is no bucket for backups`);
  }

  return bucket;
};

const getBackupBucket = async (projectId: string): Promise<Bucket> => {
  const bucket = storage().bucket(`${projectId}-backup`);
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

const verifySetup = (token: string): void | never => {
  const backupSetup = { token: process.env.BACKUP_TOKEN };

  if (!CreateBackupPayload.is(backupSetup)) {
    throw errors.invalidArg(`Lack of token on server process`);
  }

  if (token !== backupSetup.token) {
    throw errors.invalidArg(`Wrong token`);
  }
};

const getBucketsPair = async (projectId: string): Promise<BucketsPair> => {
  const [sourceBucket, backupBucket] = await Promise.all([
    getSourceBucket(),
    getBackupBucket(projectId),
  ]);

  const buckets: BucketsPair = {
    source: sourceBucket,
    backup: backupBucket,
  };

  return buckets;
};

const getDatabaseBackupFile = async (
  buckets: BucketsPair,
  backupId: IUseBackupPayload['backupId'],
): Promise<DatabaseData> => {
  const [files] = await buckets.backup.getFiles({
    delimiter: `/`,
    prefix: `${backupId}/db/data`,
  });

  if (files.length === 0)
    throw errors.invalidArg(`Cannot find database backup`);

  if (files.length !== 1)
    throw errors.invalidArg(`Multiple database backups found`);

  const [dbBackupFile] = await files[0].download();
  const databaseData = JSON.parse(
    dbBackupFile.toString(`utf8`),
  ) as DatabaseData;

  return databaseData;
};

const removeDatabase = async (): Promise<void> => {
  const db = firestore();
  const collections = await db.listCollections();

  const removePromises: Promise<firestore.WriteResult>[] = [];

  for (const collection of collections) {
    const collectionInstance = db.collection(collection.id);

    const docs = await collectionInstance.listDocuments();

    docs.forEach((doc) => {
      removePromises.push(doc.delete());
    });
  }

  await Promise.all(removePromises);
};

const applyBackupToDatabase = async (
  databaseData: DatabaseData,
): Promise<void> => {
  const db = firestore();

  const restorePromises: Promise<firestore.WriteResult>[] = [];

  for (const collectionId in databaseData) {
    const collectionData = databaseData[collectionId];
    const collectionInstance = db.collection(collectionId);

    for (const documentId in collectionData) {
      const documentData = collectionData[documentId];
      const documentInstance = collectionInstance.doc(documentId);

      if (typeof documentData === `object` && documentData !== null) {
        restorePromises.push(documentInstance.set(documentData));
      }
    }
  }

  await Promise.all(restorePromises);
};

const applyBackupToStorage = async (buckets: BucketsPair): Promise<void> => {
  const [backupFiles] = await buckets.backup.getFiles();

  const copyPromises: Promise<CopyResponse>[] = [];

  const filesWithoutDbData = backupFiles.filter(
    (file) => !file.name.includes(`db/`),
  );

  for (const backupFile of filesWithoutDbData) {
    // Omits [date]/storage.
    const backupFileNameWithoutPrefixes = backupFile.name
      .split(`/`)
      .slice(2)
      .join(`/`);
    copyPromises.push(
      backupFile.copy(buckets.source.file(backupFileNameWithoutPrefixes)),
    );
  }

  await Promise.all(copyPromises);
};

const BackupsService = {
  create: async (
    projectId: string,
    payload: ICreateBackupPayload,
  ): Promise<void> => {
    verifySetup(payload.token);

    const backupId = createBackupId();

    const buckets = await getBucketsPair(projectId);

    await Promise.all([
      createDatabaseBackup(backupId, buckets),
      createStorageBackup(backupId, buckets),
    ]);
  },
  use: async (projectId: string, payload: IUseBackupPayload): Promise<void> => {
    verifySetup(payload.token);

    const buckets = await getBucketsPair(projectId);

    const [databaseData] = await Promise.all([
      getDatabaseBackupFile(buckets, payload.backupId),
      removeDatabase(),
    ]);

    await Promise.all([
      applyBackupToDatabase(databaseData),
      applyBackupToStorage(buckets),
    ]);
  },
};

export { BackupsService };
