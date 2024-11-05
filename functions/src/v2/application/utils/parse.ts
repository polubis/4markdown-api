import { z, type AnyZodObject, type ZodUnion, ZodObject } from 'zod';
import { errors } from './errors';

const parse = async <
  TSchema extends AnyZodObject | ZodUnion<[AnyZodObject, ...AnyZodObject[]]>,
>(
  schema: TSchema,
  payload: unknown,
): Promise<z.infer<TSchema>> => {
  try {
    const result = await (schema instanceof ZodObject
      ? schema.strict()
      : schema
    ).parseAsync(payload);

    return result;
  } catch (e: unknown) {
    throw errors.schema(e);
  }
};

export { parse };
