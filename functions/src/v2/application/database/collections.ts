import * as admin from 'firebase-admin';

const collections = {
  documents: () => admin.firestore().collection(`docs`),
  images: () => admin.firestore().collection(`images`),
  documentsRates: () => admin.firestore().collection(`documents-rates`),
};

export { collections };
