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

type IErrorSymbol =
  | `UNAUTHENTICATED`
  | `INVALID_PAYLOAD`
  | `INTERNAL`
  | `INVALID_SCHEMA`;

type IErrorHandler = (
  symbol: IErrorSymbol,
  message: string,
) => https.HttpsError;
type IErrors = Record<string, IErrorHandler>;
type IErrorHandlerFactory = (code: https.FunctionsErrorCode) => IErrorHandler;

export type {
  IControllerHandler,
  IController,
  IJob,
  IJobHandler,
  IErrorHandler,
  IErrors,
  IErrorHandlerFactory,
};
