import { https, HttpsFunction, Runnable } from 'firebase-functions';
import { errors } from './errors';

type IMediatorHandler<TResponse = unknown> = (
  payload: unknown,
  context: https.CallableContext,
  authenticated: boolean,
) => Promise<TResponse>;

type IMediatorConfig = {
  authentication: boolean;
};

const mediator = <TResponse = unknown>(
  config: IMediatorConfig,
  handler: IMediatorHandler<TResponse>,
): HttpsFunction & Runnable<unknown> =>
  https.onCall(async (payload, context) => {
    const authenticated = !!context.auth;

    if (config.authentication && !authenticated) {
      throw errors.unauthenticated();
    }

    return await handler(payload, context, authenticated);
  });

export { mediator };
