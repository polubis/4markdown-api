import { https, HttpsFunction, Runnable } from 'firebase-functions';

type IMediatorHandler<TResponse = unknown> = (
  payload: unknown,
  context: https.CallableContext,
) => Promise<TResponse>;

type IMediator = <TResponse = unknown>(
  handler: IMediatorHandler<TResponse>,
) => HttpsFunction & Runnable<unknown>;

const mediator: IMediator = (handler) =>
  https.onCall(async (payload, context) => {
    return await handler(payload, context);
  });

export { mediator };
