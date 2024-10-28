import { errors } from './errors';
import { Db, type DBInstance } from '../database/database';
import { type Firestore } from 'firebase-admin/firestore';
import { onCall, type CallableFunction } from 'firebase-functions/https';

type ControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: { db: DBInstance },
) => Promise<TResponse>;

const controller =
  <TResponse = unknown>(handler: ControllerHandler<TResponse>) =>
  (firestore: Firestore): CallableFunction<unknown, unknown> => {
    const db = Db(firestore);

    return onCall({ maxInstances: 2 }, async (rawPayload: unknown) => {
      return await handler(rawPayload, { db });
    });
  };

type ProtectedControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: { uid: string; db: DBInstance },
) => Promise<TResponse>;

const protectedController =
  <TResponse = unknown>(handler: ProtectedControllerHandler<TResponse>) =>
  (firestore: Firestore): CallableFunction<unknown, unknown> => {
    const db = Db(firestore);

    return onCall<unknown>({ maxInstances: 2 }, async (request) => {
      const { auth } = request;

      if (!auth) throw errors.unauthenticated();

      const { uid } = auth;

      return await handler(request.data, { uid, db });
    });
  };
export { controller, protectedController };
