import { CallableContext } from 'firebase-functions/v1/https';
import { errors } from '../core/errors';
import { AuthData } from 'firebase-functions/lib/common/providers/https';

export const AuthService = {
  authorize: (context: CallableContext): AuthData => {
    if (!context.auth) {
      throw errors.notAuthorized();
    }

    return context.auth;
  },
};
