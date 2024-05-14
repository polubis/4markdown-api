import { z } from 'zod';
import { createSchema } from '../validation/create-schema';

const noEdgeSpacesRgx = /^\s+|\s+$/;

const avatarVariantSchema = z.object({
  h: z.number(),
  w: z.number(),
  src: z.string().url(),
  ext: z.enum([`webp`]),
});

const schema = z.object({
  displayName: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/)
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
  cdate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
  mdate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
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
