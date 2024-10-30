import { errors } from './errors';
import { Db, type DBInstance } from '../database/database';
import { type Firestore } from 'firebase-admin/firestore';
import { onCall, type CallableFunction } from 'firebase-functions/https';
import { type Email } from './validators';
import type { ProjectId } from '../infra/models';

type Secret = 'EMAILS_API_KEY';
type Secrets = Secret[];

type ControllerConfig = {
  db: Firestore;
  secrets?: Secrets;
  projectId: ProjectId;
};

// @TODO[PRIO=1]: [Make it better typed].
type ControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: {
    db: DBInstance;
    projectId: ProjectId;
  },
) => Promise<TResponse>;

const getSecrets = (secrets?: Secrets): Secrets => secrets ?? [];

// @TODO[PRIO=2]: [Add and test parent try catch].
const controller =
  <TResponse = unknown>(handler: ControllerHandler<TResponse>) =>
  (config: ControllerConfig): CallableFunction<unknown, unknown> => {
    const db = Db(config.db);

    return onCall<unknown>(
      { maxInstances: 2, secrets: getSecrets(config.secrets) },
      async (request) => {
        return await handler(request.data, { db, projectId: config.projectId });
      },
    );
  };

type ProtectedControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: {
    uid: string;
    db: DBInstance;
    isAdmin: boolean;
    projectId: ProjectId;
  },
) => Promise<TResponse>;

const isAdmin = (email?: Email): boolean => process.env.ADMIN_EMAIL === email;

const protectedController =
  <TResponse = unknown>(handler: ProtectedControllerHandler<TResponse>) =>
  (config: ControllerConfig): CallableFunction<unknown, unknown> => {
    const db = Db(config.db);

    return onCall<unknown>(
      { maxInstances: 2, secrets: getSecrets(config.secrets) },
      async (request) => {
        const { auth } = request;

        if (!auth) throw errors.unauthenticated();

        const { uid } = auth;

        return await handler(request.data, {
          uid,
          db,
          isAdmin: isAdmin(auth.token.email),
          projectId: config.projectId,
        });
      },
    );
  };

// @TODO[PRIO=1]: [Add Admin Only controller].

export { controller, protectedController };
