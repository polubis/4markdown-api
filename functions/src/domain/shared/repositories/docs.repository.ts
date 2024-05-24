import { firestore } from 'firebase-admin';
import { getCollection } from './general';
import { IDocsRepositoryFactory } from './defs';

const DocsRepository: IDocsRepositoryFactory = () => {
  const db = firestore();
  const collection = getCollection(db, `docs`);

  return {
    getCollection: async () => (await getCollection(db, `docs`).get()).docs,
    getEntity: async (uid) => {
      const { exists, data } = await collection.doc(uid).get();

      return exists ? data() : undefined;
    },
    setEntity: async (uid, entity) => {
      await collection.doc(uid).set(entity);
    },
    updateEntity: async (uid, entity) => {
      await collection.doc(uid).update(entity);
    },
    getAllEntities: async () => {
      const docs = (await collection.get()).docs.map((doc) => doc.data());
      return docs;
    },
  };
};

export { DocsRepository };
