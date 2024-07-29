import * as admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

const COLLECTIONS_KEYS = [`docs`, `images`, `documents-rates`] as const;
type DBCollectionKey = (typeof COLLECTIONS_KEYS)[number];

const Db = (db: Firestore) => {
  return {
    runTransaction: db.runTransaction,
    collection: (
      key: DBCollectionKey,
    ): admin.firestore.CollectionReference<admin.firestore.DocumentData> => {
      return db.collection(key);
    },
  };
};

type DBInstance = ReturnType<typeof Db>;

export type { DBInstance };
export { Db };
