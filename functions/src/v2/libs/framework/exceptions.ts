import { https } from 'firebase-functions';

type IExceptionsLookup = Record<
  string,
  (symbol: string, content: string) => https.HttpsError
>;

type IErrorFactory = (
  code: https.FunctionsErrorCode,
  symbol: string,
) => (content: string) => https.HttpsError;

const error: IErrorFactory = (code, symbol) => (content) =>
  new https.HttpsError(
    code,
    JSON.stringify({
      symbol,
      content,
    }),
  );

const errors = {
  exists: error(`already-exists`, `exists`),
} satisfies IExceptionsLookup;

type IErrorSymbol = keyof typeof errors;
type IExceptionThrower = (key: IErrorSymbol, content: string) => never;

const exception: IExceptionThrower = (key, content) => {
  throw errors[key](content);
};

export { exception };
