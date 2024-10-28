import { errors } from './errors';
import { Db, type DBInstance } from '../database/database';
import { type Firestore } from 'firebase-admin/firestore';
import { onCall, type CallableFunction } from 'firebase-functions/https';

// @TODO[PRIO=1]: [Make it better typed].
type ControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: { db: DBInstance },
) => Promise<TResponse>;
// @TODO[PRIO=2]: [Add and test parent try catch].
const controller =
  <TResponse = unknown>(handler: ControllerHandler<TResponse>) =>
  (firestore: Firestore): CallableFunction<unknown, unknown> => {
    const db = Db(firestore);

    return onCall<unknown>({ maxInstances: 2 }, async (request) => {
      return await handler(request.data, { db });
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
