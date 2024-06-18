import { https } from 'firebase-functions';

type IErrorsLookup = Record<
  string,
  (symbol: string, content: string) => https.HttpsError
>;

type IErrorFactory = (
  code: https.FunctionsErrorCode,
  symbol: string,
) => (content: string) => https.HttpsError;

const createError: IErrorFactory = (code, symbol) => (content) =>
  new https.HttpsError(
    code,
    JSON.stringify({
      symbol,
      content,
    }),
  );

const errors = {
  exists: createError(`already-exists`, `exists`),
} satisfies IErrorsLookup;

type IErrorSymbol = keyof typeof errors;
type IExceptionThrower = (
  key: IErrorSymbol,
  content: string,
) => https.HttpsError;

const error: IExceptionThrower = (key, content) => errors[key](content);

export { error };
