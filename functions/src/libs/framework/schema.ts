import { AnyZodObject, z } from 'zod';
import { errors } from './errors';

const Schema = <TSchema extends AnyZodObject>(
  schema: TSchema,
  name: string,
) => {
  const parser = (payload: unknown): z.infer<TSchema> => {
    try {
      const values = schema.strict().parse(payload);
      return values;
    } catch (err) {
      throw errors.invalidArgument(`INVALID_SCHEMA`, name);
    }
  };

  parser.schema = schema;
  parser.is = (payload: unknown): payload is z.infer<TSchema> =>
    schema.safeParse(payload).success;

  return parser;
};

export { Schema };
