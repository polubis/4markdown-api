import { type UserProfileModel } from '@domain/models/user-profile';
import { base64, date, text, url } from '@utils/validators';
import { z } from 'zod';

const updateYourUserProfilePayloadSchema = z.object({
  mdate: date,
  profile: z.object({
    displayName: text.min(2).max(30).nullable(),
    avatar: z.union([
      z.object({
        type: z.literal(`noop`),
      }),
      z.object({
        type: z.literal(`update`),
        data: base64,
      }),
      z.object({
        type: z.literal(`remove`),
      }),
    ]),
    bio: text.min(20).max(500).nullable(),
    githubUrl: url.nullable(),
    fbUrl: url.nullable(),
    linkedInUrl: url.nullable(),
    blogUrl: url.nullable(),
    twitterUrl: url.nullable(),
  }),
});

type UpdateYourUserProfilePayload = z.infer<
  typeof updateYourUserProfilePayloadSchema
>;
type UpdateYourUserProfileDto = {
  mdate: UserProfileModel['mdate'];
  profile: UserProfileModel;
};

export { updateYourUserProfilePayloadSchema };
export type { UpdateYourUserProfilePayload, UpdateYourUserProfileDto };
