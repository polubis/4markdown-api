import * as admin from 'firebase-admin';

const COLLECTIONS_KEYS = [`docs`, `images`, `documents-rates`] as const;
type DBCollectionKey = (typeof COLLECTIONS_KEYS)[number];

const Db = () => {
  const fs = admin.firestore();

  return {
    collection: (
      key: DBCollectionKey,
    ): admin.firestore.CollectionReference<admin.firestore.DocumentData> => {
      return fs.collection(key);
    },
  };
};

export { Db };
