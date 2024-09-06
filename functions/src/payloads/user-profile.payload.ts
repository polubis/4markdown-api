import { z } from 'zod';
import { createSchema } from '../validation/create-schema';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { base64Rgx } from '../validation/regex';

const schema = UserProfileEntity.schema
  .pick({
    bio: true,
    displayName: true,
    githubUrl: true,
    blogUrl: true,
    linkedInUrl: true,
    fbUrl: true,
    twitterUrl: true,
  })
  .merge(
    z.object({
      avatar: z.union([
        z.object({
          type: z.literal(`noop`),
        }),
        z.object({
          type: z.literal(`update`),
          data: z.string().regex(base64Rgx),
        }),
        z.object({
          type: z.literal(`remove`),
        }),
      ]),
    }),
  )
  .extend({
    mdate: UserProfileEntity.schema.shape.mdate.nullable(),
  });

type IUserProfilePayload = z.infer<typeof schema>;

const UserProfilePayload = createSchema(schema, `UserProfilePayload`);

export type { IUserProfilePayload };
export { UserProfilePayload };
