import * as admin from 'firebase-admin';
import type { Firestore, Transaction } from 'firebase-admin/firestore';

const COLLECTIONS_KEYS = [
  `docs`,
  `images`,
  `documents-rates`,
  `users-profiles`,
] as const;
type DBCollectionKey = (typeof COLLECTIONS_KEYS)[number];

const Db = (db: Firestore) => {
  return {
    runTransaction: <T>(
      updateFunction: (transaction: Transaction) => Promise<T>,
    ) => {
      return db.runTransaction(updateFunction);
    },
    collection: (
      key: DBCollectionKey,
    ): admin.firestore.CollectionReference<admin.firestore.DocumentData> => {
      return db.collection(key);
    },
  };
};

type DBInstance = ReturnType<typeof Db>;

export type { DBInstance, DBCollectionKey };
export { Db };
