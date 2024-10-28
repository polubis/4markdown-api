import { CallableRequest } from 'firebase-functions/https';
import { errors } from '../v2/application/utils/errors';

export const AuthService = {
  authorize: (
    context: Pick<CallableRequest<unknown>, 'auth'>,
  ): Required<Pick<CallableRequest<unknown>, 'auth'>>['auth'] => {
    if (!context.auth) {
      throw errors.unauthenticated();
    }

    return context.auth;
  },
};
