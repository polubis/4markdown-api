import { HttpsError } from 'firebase-functions/v1/auth';

export const errors = {
  invalidArg: (message: string): never => {
    throw new HttpsError(`invalid-argument`, message);
  },
  notAuthorized: (): never => {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  },
  notFound: (): never => {
    throw new HttpsError(
      `not-found`,
      `Operation not allowed, not found record`,
    );
  },
  exists: (message: string): never => {
    throw new HttpsError(`already-exists`, message);
  },
  internal: (message: string): never => {
    throw new HttpsError(`internal`, message);
  },
  outOfDateEntry: (message: string): never => {
    throw new HttpsError(`resource-exhausted`, message);
  },
};
