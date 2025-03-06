import * as admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

const COLLECTIONS_KEYS = [
  `docs`,
  `images`,
  `documents-rates`,
  `comments`,
  `users-profiles`,
  `account-permissions`,
  `document-comments`,
  `user-mindmaps`,
  `mindmaps`,
] as const;
type DBCollectionKey = (typeof COLLECTIONS_KEYS)[number];

const Db = (db: Firestore) => {
  return {
    runTransaction: db.runTransaction,
    collection: (
      key: DBCollectionKey,
    ): admin.firestore.CollectionReference<admin.firestore.DocumentData> => {
      return db.collection(key);
    },
    collectionGroup: db.collectionGroup,
  };
};

type DBInstance = ReturnType<typeof Db>;

export type { DBInstance, DBCollectionKey };
export { Db };
