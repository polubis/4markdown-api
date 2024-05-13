import { z } from 'zod';
import { createSchema } from '../validation/create-schema';
import { UserProfileEntity } from '../entities/user-profile.entity';

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
          data: z.string(),
        }),
        z.object({
          type: z.literal(`remove`),
        }),
      ]),
    }),
  );

type IUserProfilePayload = z.infer<typeof schema>;

const UserProfilePayload = createSchema(schema, `UserProfilePayload`);

export type { IUserProfilePayload };
export { UserProfilePayload };
