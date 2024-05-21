import type {
  CloudFunction,
  HttpsFunction,
  Runnable,
  https,
} from 'firebase-functions';

type IEndpointHandler<TResponse = unknown> = (
  payload: unknown,
  context: https.CallableContext,
) => Promise<TResponse>;
type IEndpoint = <TResponse = unknown>(
  handler: IEndpointHandler<TResponse>,
) => HttpsFunction & Runnable<any>;

type IJobHandler = () => Promise<void>;
type IJob = (interval: string, handler: IJobHandler) => CloudFunction<unknown>;

export type { IEndpointHandler, IEndpoint, IJob, IJobHandler };
