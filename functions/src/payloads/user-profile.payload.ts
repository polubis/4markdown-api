import { z } from 'zod';
import { errors } from '../core/errors';

const schema = z.object({
  displayName: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/)
    .min(2)
    .max(25)
    .nullable(),
  bio: z.string().min(60).max(300).nullable(),
  avatar: z.union([
    z.object({
      type: z.literal(`noop`),
    }),
    z.object({
      type: z.literal(`update`),
      data: z.string().base64(),
    }),
    z.object({
      type: z.literal(`remove`),
    }),
  ]),
  githubUrl: z.string().url().nullable(),
  fbUrl: z.string().url().nullable(),
  linkedInUrl: z.string().url().nullable(),
  blogUrl: z.string().url().nullable(),
  twitterUrl: z.string().url().nullable(),
});

const UserProfilePayload = (payload: unknown): z.infer<typeof schema> => {
  try {
    const values = schema.parse(payload);

    return values;
  } catch (err) {
    throw errors.invalidArg(`Passed payload is invalid`);
  }
};

export { UserProfilePayload };
