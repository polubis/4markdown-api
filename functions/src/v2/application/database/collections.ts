import * as admin from 'firebase-admin';

const collections = {
  documents: () => admin.firestore().collection(`docs`),
  images: () => admin.firestore().collection(`images`),
};

export { collections };
