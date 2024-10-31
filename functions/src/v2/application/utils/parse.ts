import { z, AnyZodObject } from 'zod';
import { errors } from './errors';
// @TODO[PRIO=3]: [Transform return to "safePayload" object].
const parse = async <TSchema extends AnyZodObject>(
  schema: TSchema,
  payload: unknown,
): Promise<z.infer<TSchema>> => {
  try {
    const result = await schema.strict().parseAsync(payload);
    return result;
  } catch (e: unknown) {
    throw errors.schema(e);
  }
};

export { parse };
