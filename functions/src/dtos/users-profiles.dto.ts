import { z } from 'zod';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { createSchema } from '../validation/create-schema';

const schema = z.object({
  mdate: UserProfileEntity.schema.shape.mdate,
  profile: UserProfileEntity.schema.pick({
    displayName: true,
    id: true,
    avatar: true,
    bio: true,
    githubUrl: true,
    linkedInUrl: true,
    blogUrl: true,
    fbUrl: true,
    twitterUrl: true,
  }),
});

type IUserProfileDto = z.infer<typeof schema>;

const UserProfileDto = createSchema(schema, `UserProfileDto`);

export type { IUserProfileDto };
export { UserProfileDto };
