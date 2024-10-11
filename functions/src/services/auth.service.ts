import { CallableContext } from 'firebase-functions/v1/https';
import { AuthData } from 'firebase-functions/lib/common/providers/https';
import { errors } from '../v2/application/utils/errors';

export const AuthService = {
  authorize: (context: CallableContext): AuthData => {
    if (!context.auth) {
      throw errors.unauthenticated();
    }

    return context.auth;
  },
};
