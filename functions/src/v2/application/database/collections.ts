import * as admin from 'firebase-admin';

const collections = {
  documents: () => admin.firestore().collection(`docs`),
};

export { collections };
