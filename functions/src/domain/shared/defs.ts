import { https } from 'firebase-functions';

type IErrorHandler = (symbol: string, message: string) => https.HttpsError;
type IErrors = Record<string, IErrorHandler>;
type IErrorHandlerFactory = (code: https.FunctionsErrorCode) => IErrorHandler;

export type { IErrors, IErrorHandler, IErrorHandlerFactory };
