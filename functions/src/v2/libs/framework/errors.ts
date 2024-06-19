import { https } from 'firebase-functions';
import { z } from 'zod';

const error = (
  code: https.FunctionsErrorCode,
  symbol: string,
  content: unknown,
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
    error(`already-exists`, `already-exists`, content),
  unauthenticated: (content = `Unauthenticated`) =>
    error(`unauthenticated`, `unauthenticated`, content),
  internal: (content = `Something went wrong`) =>
    error(`internal`, `internal`, content),
  schema: (e: unknown) => {
    if (e instanceof z.ZodError) {
      return error(
        `invalid-argument`,
        `invalid-schema`,
        e.errors.map(({ message, path }) => ({ message, key: path[0] })),
      );
    }

    return errors.internal();
  },
  notFound: (content = `Not found`) => error(`not-found`, `not-found`, content),
  outOfDate: (content = `Resource out of date`) =>
    error(`resource-exhausted`, `out-of-date`, content),
};

export { errors };
