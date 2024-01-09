import * as admin from 'firebase-admin';
import { Id } from '../entities/general';
import { DocEntity } from '../entities/doc.entity';

export const DocsRepository = (uid: Id) => {
  const collection = admin.firestore().collection(`docs`);

  return {
    getMy: async () => {
      const docsCollection = collection.doc(uid);
      return await docsCollection.get();
    },
    update: async (entity: DocEntity) => {
      const docsCollection = collection.doc(uid);
      return await docsCollection.update(entity);
    },
  };
};
