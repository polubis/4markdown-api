import type {
  CloudFunction,
  HttpsFunction,
  Runnable,
  https,
} from 'firebase-functions';

type IControllerHandler<TResponse = unknown> = (
  context: https.CallableContext,
  payload: unknown,
) => Promise<TResponse>;
type IControllerMiddleware = (
  context: https.CallableContext,
  payload: unknown,
) => void;

type IController = <TResponse = unknown>(
  ...middleware: IControllerMiddleware[]
) => (handler: IControllerHandler<TResponse>) => HttpsFunction & Runnable<any>;

type IJobHandler = () => Promise<void>;
type IJob = (interval: string, handler: IJobHandler) => CloudFunction<unknown>;

export type { IControllerHandler, IController, IJob, IJobHandler };
