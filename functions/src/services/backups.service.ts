import { BackupPayload, IBackupPayload } from '../payloads/backup.payload';
import { errors } from '../core/errors';
import { firestore } from 'firebase-admin';
import { z } from 'zod';

const collectionIdSchema = z.enum([`docs`, `images`, `users-profiles`]);

type CollectionId = z.infer<typeof collectionIdSchema>;

type DatabaseData = Record<CollectionId, Record<string, unknown>>;

const getDatabase = async (
  instance: firestore.Firestore,
): Promise<DatabaseData> => {
  const collections = await instance.listCollections();

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

const BackupsService = {
  create: async (payload: IBackupPayload): Promise<void> => {
    const backupSetup = { token: process.env.BACKUP_TOKEN };

    if (!BackupPayload.is(backupSetup)) {
      throw errors.invalidArg(`Lack of token on server process`);
    }

    if (payload.token !== backupSetup.token) {
      throw errors.invalidArg(`Wrong token`);
    }

    const instance = firestore();

    try {
      const databaseData = await getDatabase(instance);
    } catch (err) {
      throw errors.internal(`Problem with database integrity`);
    }

    return Promise.resolve();
  },
};

export { BackupsService };
