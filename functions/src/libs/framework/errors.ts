import { https } from 'firebase-functions';
import { IErrorHandlerFactory, IErrors } from './defs';

const Error: IErrorHandlerFactory = (code) => (symbol, message) =>
  new https.HttpsError(code, `[${symbol}][${message}]`);

export const errors = {
  invalidArgument: Error(`invalid-argument`),
  unauthenticated: Error(`unauthenticated`),
  notFound: Error(`not-found`),
  alreadyExists: Error(`already-exists`),
  internal: Error(`internal`),
  resourceExhausted: Error(`resource-exhausted`),
} satisfies IErrors;
