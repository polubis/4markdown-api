import { z } from 'zod';
import { createSchema } from '../validation/create-schema';
import { dateRgx, noEdgeSpacesRgx, usernameRgx } from '../validation/regex';

const avatarVariantSchema = z.object({
  id: z.string().uuid(),
  h: z.number(),
  w: z.number(),
  src: z.string().url(),
  ext: z.enum([`webp`]),
});

const schema = z.object({
  displayName: z
    .string()
    .regex(usernameRgx)
    .min(2)
    .max(25)
    .regex(noEdgeSpacesRgx)
    .nullable(),
  avatar: z
    .object({
      tn: avatarVariantSchema,
      sm: avatarVariantSchema,
      md: avatarVariantSchema,
      lg: avatarVariantSchema,
    })
    .nullable(),
  bio: z.string().min(60).max(300).regex(noEdgeSpacesRgx).nullable(),
  githubUrl: z.string().url().regex(noEdgeSpacesRgx).nullable(),
  fbUrl: z.string().url().regex(noEdgeSpacesRgx).nullable(),
  linkedInUrl: z.string().url().regex(noEdgeSpacesRgx).nullable(),
  blogUrl: z.string().url().regex(noEdgeSpacesRgx).nullable(),
  twitterUrl: z.string().url().regex(noEdgeSpacesRgx).nullable(),
  id: z.string().uuid(),
  cdate: z.string().regex(dateRgx),
  mdate: z.string().regex(dateRgx),
});

type IUserProfileEntity = z.infer<typeof schema>;
type IUserProfileAvatarSizeVariant = keyof NonNullable<
  IUserProfileEntity['avatar']
>;
type IUserProfileEntityAvatar = IUserProfileEntity['avatar'];

const UserProfileEntity = createSchema(schema, `UserProfileEntity`);

export {
  UserProfileEntity,
  IUserProfileEntity,
  IUserProfileEntityAvatar,
  IUserProfileAvatarSizeVariant,
};
