import { https } from 'firebase-functions';

import { errors } from './errors';
import { AuthData } from 'firebase-functions/lib/common/providers/https';

/**
 * Retrieves authentication data from the Firebase Callable Context.
 * Throws an error if not authorized.
 * @param {Object} ctx - The Firebase Callable Context object.
 * @returns {AuthData} - The authentication data.
 * @throws {Error} - Throws an error if not authorized.
 */
const identified = (ctx: https.CallableContext): AuthData | never => {
  const auth = ctx.auth;

  if (!auth) {
    throw errors.notAuthorized();
  }

  return auth;
};

export { identified };
