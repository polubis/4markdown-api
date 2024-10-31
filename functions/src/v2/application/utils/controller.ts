import { errors } from './errors';
import { Db, type DBInstance } from '../database/database';
import { type Firestore } from 'firebase-admin/firestore';
import { onCall, type CallableFunction } from 'firebase-functions/https';
import { type Email } from './validators';
import type { ProjectId } from '../infra/models/atoms';
// @TODO[PRIO=2]: [Split it into separate library].
type Secret = 'EMAILS_API_KEY' | 'EMAILS_ENCRYPTION_TOKEN';
type Secrets = Secret[];

type ControllerConfig = {
  db: Firestore;
  secrets?: Secrets;
  projectId: ProjectId;
  maxInstances?: number;
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
const getMaxInstances = (maxInstances?: number) => maxInstances ?? 1;

// @TODO[PRIO=2]: [Add and test parent try catch].
const controller =
  <TResponse = unknown>(handler: ControllerHandler<TResponse>) =>
  (config: ControllerConfig): CallableFunction<unknown, unknown> => {
    const db = Db(config.db);

    return onCall<unknown>(
      {
        maxInstances: getMaxInstances(config.maxInstances),
        secrets: getSecrets(config.secrets),
      },
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
    projectId: ProjectId;
  },
) => Promise<TResponse>;
// @TODO[PRIO=2]: [Transfer rawPayload as object property and as a single object].
const protectedController =
  <TResponse = unknown>(handler: ProtectedControllerHandler<TResponse>) =>
  (config: ControllerConfig): CallableFunction<unknown, unknown> => {
    const db = Db(config.db);

    return onCall<unknown>(
      {
        maxInstances: getMaxInstances(config.maxInstances),
        secrets: getSecrets(config.secrets),
      },
      async (request) => {
        const { auth } = request;

        if (!auth) throw errors.unauthenticated();

        const { uid } = auth;

        return await handler(request.data, {
          uid,
          db,
          projectId: config.projectId,
        });
      },
    );
  };

type AdminControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: {
    uid: string;
    db: DBInstance;
    projectId: ProjectId;
  },
) => Promise<TResponse>;

const isAdmin = (email?: Email): boolean => process.env.ADMIN_EMAIL === email;

const adminController =
  <TResponse = unknown>(handler: AdminControllerHandler<TResponse>) =>
  (config: ControllerConfig): CallableFunction<unknown, unknown> => {
    const db = Db(config.db);

    return onCall<unknown>(
      {
        maxInstances: getMaxInstances(config.maxInstances),
        secrets: getSecrets(config.secrets),
      },
      async (request) => {
        const { auth } = request;

        if (!auth) throw errors.unauthenticated();

        if (!isAdmin(auth.token.email)) throw errors.unauthorized();

        const { uid } = auth;

        return await handler(request.data, {
          uid,
          db,
          projectId: config.projectId,
        });
      },
    );
  };

export { controller, protectedController, adminController };
