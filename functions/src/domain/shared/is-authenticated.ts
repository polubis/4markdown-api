import { https } from 'firebase-functions';
import { errors } from './errors';

const isAuthenticated = (
  context: https.CallableContext,
): https.CallableContext['auth'] => {
  if (!context.auth) {
    throw errors.unauthenticated(`UNAUTHENTICATED`, `No permissions`);
  }

  return context.auth;
};

export { isAuthenticated };
