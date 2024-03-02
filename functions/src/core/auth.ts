import { https } from 'firebase-functions';

import { errors } from './errors';
import { AuthData } from 'firebase-functions/lib/common/providers/https';

/**
 * Retrieves authentication data from the provided Firebase Callable Context.
 * Throws an error if authentication data is not available.
 * @param {Object} ctx The Firebase Callable Context object.
 * @returns {AuthData} The authentication data extracted from the context.
 * @throws {Error} Throws a 'notAuthorized' error if authentication data is not available.
 */
const identified = (ctx: https.CallableContext): AuthData | never => {
  const auth = ctx.auth;

  if (!auth) {
    throw errors.notAuthorized();
  }

  return auth;
};

export { identified };
