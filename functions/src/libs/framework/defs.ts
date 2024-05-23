import type {
  CloudFunction,
  HttpsFunction,
  Runnable,
  https,
} from 'firebase-functions';

type IControllerHandler<TResponse = unknown> = (
  payload: unknown,
  context: https.CallableContext,
) => Promise<TResponse>;
type IController = <TResponse = unknown>(
  handler: IControllerHandler<TResponse>,
) => HttpsFunction & Runnable<any>;

type IJobHandler = () => Promise<void>;
type IJob = (interval: string, handler: IJobHandler) => CloudFunction<unknown>;

export type { IControllerHandler, IController, IJob, IJobHandler };
