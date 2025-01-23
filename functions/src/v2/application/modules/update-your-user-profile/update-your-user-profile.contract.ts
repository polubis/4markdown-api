import { type UserProfileModel } from '@domain/models/user-profile';
import { base64, date, text, url } from '@utils/validators';
import { z } from 'zod';

const updateYourUserProfilePayloadSchema = z.object({
  mdate: date,
  displayName: text
    .min(2, `Display name must be at least 2 characters long`)
    .max(30, `Display name can be up to 30 characters long`)
    .nullable(),
  avatar: z.union([
    z.object({
      type: z.literal(`noop`),
    }),
    z.object({
      type: z.literal(`update`),
      data: base64(`Avatar must be in base64 format`),
    }),
    z.object({
      type: z.literal(`remove`),
    }),
  ]),
  bio: text
    .min(20, `Bio must be at least 20 characters long`)
    .max(500, `Bio can be up to 500 characters long`)
    .nullable(),
  githubUrl: url(`The GitHub URL format is invalid`).nullable(),
  fbUrl: url(`The Facebook URL format is invalid`).nullable(),
  linkedInUrl: url(`The LinkedIn URL format is invalid`).nullable(),
  blogUrl: url(`The website URL format is invalid`).nullable(),
  twitterUrl: url(`The Twitter URL format is invalid`).nullable(),
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
