import { errors } from './errors';
import { Db, type DBInstance } from '../database/database';
import { type Firestore } from 'firebase-admin/firestore';
import { onCall, type CallableFunction } from 'firebase-functions/https';
import { isAdmin } from './is-admin';

type Secret = 'EMAILS_API_KEY';
type Secrets = Secret[];

// @TODO[PRIO=1]: [Make it better typed].
type ControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: { db: DBInstance; projectId: string },
) => Promise<TResponse>;
// @TODO[PRIO=2]: [Add and test parent try catch].
// @TODO[PRIO=2]: [Pass config objects instead of arguments].
// @TODO[PRIO=3]: [Share project id type here instead of "string"].
const controller =
  <TResponse = unknown>(handler: ControllerHandler<TResponse>) =>
  (
    firestore: Firestore,
    projectId: string,
    secrets?: Secrets,
  ): CallableFunction<unknown, unknown> => {
    const db = Db(firestore);

    return onCall<unknown>({ maxInstances: 2, secrets }, async (request) => {
      return await handler(request.data, { db, projectId });
    });
  };

type ProtectedControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: {
    uid: string;
    db: DBInstance;
    projectId: string;
    isAdmin: boolean;
  },
) => Promise<TResponse>;

const protectedController =
  <TResponse = unknown>(handler: ProtectedControllerHandler<TResponse>) =>
  (
    firestore: Firestore,
    projectId: string,
    secrets?: Secrets,
  ): CallableFunction<unknown, unknown> => {
    const db = Db(firestore);

    return onCall<unknown>({ maxInstances: 2, secrets }, async (request) => {
      const { auth } = request;

      if (!auth) throw errors.unauthenticated();

      const { uid } = auth;

      return await handler(request.data, {
        uid,
        db,
        projectId,
        isAdmin: isAdmin(auth.token.email),
      });
    });
  };

export { controller, protectedController };
