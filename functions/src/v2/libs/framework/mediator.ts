import { https, HttpsFunction, Runnable } from 'firebase-functions';

type IMediatorHandler<TResponse = unknown> = (
  payload: unknown,
  context: https.CallableContext,
  authenticated: boolean,
) => Promise<TResponse>;

const mediator = <TResponse = unknown>(
  handler: IMediatorHandler<TResponse>,
): HttpsFunction & Runnable<unknown> =>
  https.onCall(async (payload, context) => {
    return await handler(payload, context, !!context.auth);
  });

export { mediator };
