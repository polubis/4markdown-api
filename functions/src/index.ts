import { https } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';

admin.initializeApp();

const { onCall, HttpsError } = https;

interface CreatePayload {
  name: string;
  code: string;
}

interface CreateDocDto {
  id: string;
}

export const createDoc = onCall(
  async ({ name, code }: CreatePayload, context) => {
    if (!context.auth) {
      throw new HttpsError(`unauthenticated`, `Unauthorized`);
    }

    try {
      const { uid } = context.auth;
      const id = uuid();

      await admin.firestore().collection(`docs`).doc(uid).set(
        {
          name,
          code,
          id,
        },
        { merge: true },
      );

      return <CreateDocDto>{ id };
    } catch (error) {
      throw new HttpsError(`internal`, `Internal Server Error`);
    }
  },
);
