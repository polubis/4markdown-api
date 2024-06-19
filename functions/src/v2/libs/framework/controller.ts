import { https, HttpsFunction, Runnable } from 'firebase-functions';
import { errors } from './errors';

type IControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: https.CallableContext,
  authenticated: boolean,
) => Promise<TResponse>;

type IControllerConfig = {
  authentication: boolean;
};

const controller = <TResponse = unknown>(
  config: IControllerConfig,
  handler: IControllerHandler<TResponse>,
): HttpsFunction & Runnable<unknown> =>
  https.onCall(async (rawPayload, context) => {
    const authenticated = !!context.auth;

    if (config.authentication && !authenticated) {
      throw errors.unauthenticated();
    }

    return await handler(rawPayload, context, authenticated);
  });

export { controller };
