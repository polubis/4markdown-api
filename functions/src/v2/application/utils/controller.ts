import { https, type HttpsFunction, type Runnable } from 'firebase-functions';
import { errors } from './errors';
import { Db, type DBInstance } from '../database/database';
import { type Firestore } from 'firebase-admin/firestore';

type ControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: https.CallableContext,
) => Promise<TResponse>;

const controller = <TResponse = unknown>(
  handler: ControllerHandler<TResponse>,
): HttpsFunction & Runnable<unknown> => https.onCall(handler);

type ProtectedControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: { uid: string; db: DBInstance },
) => Promise<TResponse>;

const protectedController =
  <TResponse = unknown>(handler: ProtectedControllerHandler<TResponse>) =>
  (firestore: Firestore): HttpsFunction & Runnable<unknown> => {
    const db = Db(firestore);

    return https.onCall(async (rawPayload: unknown, context) => {
      const { auth } = context;

      if (!auth) throw errors.unauthenticated();

      const { uid } = auth;

      return await handler(rawPayload, { uid, db });
    });
  };
export { controller, protectedController };
