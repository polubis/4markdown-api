import { firestore } from 'firebase-admin';
import { getCollection } from './general';
import { IDocsRepositoryFactory } from './defs';

const DocsRepository: IDocsRepositoryFactory = () => {
  const db = firestore();

  return {
    getEntity: async (uid) => {
      const { exists, data } = await getCollection(db, `docs`).doc(uid).get();

      return exists ? data() : undefined;
    },
    setEntity: async (uid, entity) => {
      await getCollection(db, `docs`).doc(uid).set(entity);
    },
  };
};

export { DocsRepository };
