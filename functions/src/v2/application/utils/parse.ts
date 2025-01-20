import {
  z,
  AnyZodObject,
  ZodUnion,
  ZodObject,
  ZodArray,
  ZodTypeAny,
  ZodString,
  ZodNull,
} from 'zod';
import { errors } from './errors';

const parse = async <
  TSchema extends
    | AnyZodObject
    | ZodUnion<[AnyZodObject, ...AnyZodObject[]]>
    | ZodArray<ZodTypeAny>
    | ZodString
    | ZodNull,
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
