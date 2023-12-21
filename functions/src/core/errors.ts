import { HttpsError } from 'firebase-functions/v1/auth';

export const invalidArg = (message: string): never => {
  throw new HttpsError(`invalid-argument`, message);
};
