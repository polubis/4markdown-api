import { https } from 'firebase-functions';

const error = (
  code: https.FunctionsErrorCode,
  symbol: string,
  content: string,
): https.HttpsError =>
  new https.HttpsError(
    code,
    JSON.stringify({
      symbol,
      content,
    }),
  );

const errors = {
  exists: (content = `Record already exists`) =>
    error(`already-exists`, `exists`, content),
  unauthenticated: (content = `Unauthenticated`) =>
    error(`unauthenticated`, `unauthenticated`, content),
};

export { errors };
