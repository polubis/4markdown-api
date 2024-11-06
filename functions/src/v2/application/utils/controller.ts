import { errors } from './errors';
import { Db, type DBInstance } from '../database/database';
import { type Firestore } from 'firebase-admin/firestore';
import { onCall, type CallableFunction } from 'firebase-functions/https';
import type { ProjectId } from '../infra/models/atoms';
import type { UserId } from '@domain/models/atoms';
import { asUserId } from '@domain/creators/atoms';
// @TODO[PRIO=2]: [Split it into separate library].
type Secret = 'EMAILS_API_KEY' | 'EMAILS_ENCRYPTION_TOKEN' | `ADMIN_LIST`;
type Secrets = Secret[];

type ControllerConfig = {
  db: Firestore;
  secrets?: Secrets;
  projectId: ProjectId;
  maxInstances?: number;
};

type RawPayload = unknown;

type ControllerHandlerContext = {
  db: DBInstance;
  projectId: ProjectId;
};

// @TODO[PRIO=1]: [Make it better typed].
type ControllerHandler<TResponse = unknown> = (
  rawPayload: RawPayload,
  context: ControllerHandlerContext,
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

type ProtectedControllerHandlerContext = {
  uid: string;
  db: DBInstance;
  projectId: ProjectId;
};

type ProtectedControllerHandler<TResponse = unknown> = (
  rawPayload: RawPayload,
  context: ProtectedControllerHandlerContext,
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

type AdminControllerHandlerContext = {
  uid: string;
  db: DBInstance;
  projectId: ProjectId;
};

// @TODO[PRIO=3]: [Force response and DTO types to be required].
type AdminControllerHandler<TResponse = unknown> = (
  rawPayload: RawPayload,
  context: AdminControllerHandlerContext,
) => Promise<TResponse>;

const isAdmin = (userId: UserId): boolean =>
  (process.env.ADMIN_LIST ?? ``).split(`|`).some((id) => id === userId);

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

        if (!isAdmin(asUserId(auth.uid))) throw errors.unauthorized();

        const { uid } = auth;

        return await handler(request.data, {
          uid,
          db,
          projectId: config.projectId,
        });
      },
    );
  };

export type {
  ProtectedControllerHandler,
  ControllerHandler,
  AdminControllerHandler,
  ControllerConfig,
  ControllerHandlerContext,
  ProtectedControllerHandlerContext,
  AdminControllerHandlerContext,
};
export { controller, protectedController, adminController };
