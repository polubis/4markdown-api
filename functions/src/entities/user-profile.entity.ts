import { z } from 'zod';
import { createSchema } from '../validation/create-schema';

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
    .nullable(),
  avatar: z
    .object({
      tn: avatarVariantSchema,
      sm: avatarVariantSchema,
      md: avatarVariantSchema,
      lg: avatarVariantSchema,
    })
    .nullable(),
  bio: z.string().min(60).max(300).nullable(),
  githubUrl: z.string().url().nullable(),
  fbUrl: z.string().url().nullable(),
  linkedInUrl: z.string().url().nullable(),
  blogUrl: z.string().url().nullable(),
  twitterUrl: z.string().url().nullable(),
  id: z.string().uuid(),
  cdate: z.date(),
  mdate: z.date(),
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
