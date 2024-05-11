import { z } from 'zod';
import { errors } from '../core/errors';
import { userProfileEntitySchema } from '../entities/user-profile.entity';

const userProfilePayloadSchema = userProfileEntitySchema
  .omit({ cdate: true, mdate: true, id: true })
  .merge(
    z.object({
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
    }),
  );

type UserProfilePayload = z.infer<typeof userProfilePayloadSchema>;

const createUserProfilePayload = (payload: unknown): UserProfilePayload => {
  try {
    const values = userProfilePayloadSchema.parse(payload);
    return values;
  } catch (err) {
    throw errors.invalidArg(`Passed payload is invalid`);
  }
};

export {
  UserProfilePayload,
  userProfilePayloadSchema,
  createUserProfilePayload,
};
