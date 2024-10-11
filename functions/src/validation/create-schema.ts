import { AnyZodObject, z } from 'zod';
import { errors } from '../v2/application/utils/errors';

const createSchema = <Schema extends AnyZodObject>(
  schema: Schema,
  name: string,
) => {
  const parser = (payload: unknown): z.infer<Schema> => {
    try {
      const values = schema.strict().parse(payload);
      return values;
    } catch (err) {
      throw errors.badRequest(`Schema is not typeof ${name}`);
    }
  };

  parser.schema = schema;
  parser.is = (payload: unknown): payload is z.infer<Schema> =>
    schema.safeParse(payload).success;

  return parser;
};

export { createSchema };
