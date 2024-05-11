import { errors } from '../core/errors';
import { z } from 'zod';

const avatarVariantSchema = z.object({
  h: z.number(),
  w: z.number(),
  src: z.string().url(),
  ext: z.enum([`webp`]),
});

const userProfileEntitySchema = z.object({
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

type UserProfileEntity = z.infer<typeof userProfileEntitySchema>;

const createUserProfileEntity = (payload: unknown): UserProfileEntity => {
  try {
    const values = userProfileEntitySchema.parse(payload);
    return values;
  } catch (err) {
    throw errors.invalidArg(`Passed UserProfileEntity payload is invalid`);
  }
};

const isUserProfileEntity = (payload: unknown): payload is UserProfileEntity =>
  userProfileEntitySchema.safeParse(payload).success;

export {
  createUserProfileEntity,
  isUserProfileEntity,
  userProfileEntitySchema,
  UserProfileEntity,
};
