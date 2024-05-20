import { BackupPayload, IBackupPayload } from '../payloads/backup.payload';
import { errors } from '../core/errors';
import { firestore, storage } from 'firebase-admin';
import { z } from 'zod';

const collectionIdSchema = z.enum([`docs`, `images`, `users-profiles`]);

type CollectionId = z.infer<typeof collectionIdSchema>;

type DatabaseData = Record<CollectionId, Record<string, unknown>>;

const getDatabase = async (): Promise<DatabaseData> => {
  const db = firestore();
  const collections = await db.listCollections();

  const data: DatabaseData = {
    docs: {},
    images: {},
    'users-profiles': {},
  };

  for (const collection of collections) {
    const snap = await collection.get();

    const collectionId = collectionIdSchema.parse(collection.id);

    snap.docs.forEach((doc) => {
      data[collectionId] = {
        [doc.id]: doc.data(),
      };
    });
  }

  return data;
};

const createOrGetBucket = async () => {
  const bucket = storage().bucket(`backups`);
  const [exists] = await bucket.exists();

  if (!exists) {
    await bucket.create();
  }

  return bucket;
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

    const data = await getDatabase();
    const bucket = await createOrGetBucket();

    const backupId = new Date().toISOString();
    const file = bucket.file(`${backupId}/db`);

    await file.save(JSON.stringify(data), {
      contentType: `application/json`,
    });

    return Promise.resolve();
  },
};

export { BackupsService };
