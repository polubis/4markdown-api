import { https, HttpsFunction, Runnable } from 'firebase-functions';
import { errors } from './errors';

type ControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: https.CallableContext,
) => Promise<TResponse>;

const controller = <TResponse = unknown>(
  handler: ControllerHandler<TResponse>,
): HttpsFunction & Runnable<unknown> => https.onCall(handler);

type ProtectedControllerHandler<TResponse = unknown> = (
  rawPayload: unknown,
  context: { uid: string },
) => Promise<TResponse>;

const protectedController = <TResponse = unknown>(
  handler: ProtectedControllerHandler<TResponse>,
): HttpsFunction & Runnable<unknown> =>
  https.onCall(async (rawPayload, context) => {
    const { auth } = context;

    if (!auth) {
      throw errors.unauthenticated();
    }

    const { uid } = auth;

    return await handler(rawPayload, { uid });
  });

export { controller, protectedController };
