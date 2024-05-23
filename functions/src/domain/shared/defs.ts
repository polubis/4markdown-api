import { https } from 'firebase-functions';

type IErrorSymbol = `UNAUTHENTICATED`;

type IErrorHandler = (
  symbol: IErrorSymbol,
  message: string,
) => https.HttpsError;
type IErrors = Record<string, IErrorHandler>;
type IErrorHandlerFactory = (code: https.FunctionsErrorCode) => IErrorHandler;

export type { IErrors, IErrorHandler, IErrorHandlerFactory };
