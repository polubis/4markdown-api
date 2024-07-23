import { firestore } from 'firebase-admin';

const collections = {
  documents: () => firestore().collection(`docs`),
  images: () => firestore().collection(`images`),
  documentsRates: () => firestore().collection(`documents-rates`),
};

export { collections };
