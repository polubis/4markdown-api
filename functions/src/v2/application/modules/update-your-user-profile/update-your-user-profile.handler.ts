import { type ProtectedControllerHandlerContext } from '@utils/controller';
import * as sharp from 'sharp';

import {
  type UpdateYourUserProfileDto,
  type UpdateYourUserProfilePayload,
} from './update-your-user-profile.contract';
import { type UserProfileModel } from '@domain/models/user-profile';
import { nowISO, uuid } from '@libs/helpers/stamps';
import { storage } from 'firebase-admin';
import { errors } from '@utils/errors';
import { decodeBase64Asset } from '@utils/decode-base64-asset';
import { createSlug } from '@utils/create-slug';

const ALLOWED_AVATAR_EXTENSIONS = [`png`, `jpeg`, `webp`, `jpg`];
const ALLOWED_AVATAR_MAX_SIZE = 4;
const AVATAR_VARIANTS = [
  {
    size: `lg`,
    h: 100,
    w: 100,
  },
  {
    size: `md`,
    h: 64,
    w: 64,
  },
  {
    size: `sm`,
    h: 32,
    w: 32,
  },
  {
    size: `tn`,
    h: 24,
    w: 24,
  },
] as const;

const uploadAvatar = async ({
  payload,
  context,
}: {
  payload: UpdateYourUserProfilePayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UserProfileModel['avatar']> => {
  if (payload.profile.avatar.type !== `update`) return null;

  const avatar = decodeBase64Asset(payload.profile.avatar.data);

  if (!ALLOWED_AVATAR_EXTENSIONS.includes(avatar.extension)) {
    throw errors.badRequest(
      `Invalid extension of avatar. Only ${ALLOWED_AVATAR_EXTENSIONS.join(
        `, `,
      )} are supported`,
    );
  }

  if (avatar.size > ALLOWED_AVATAR_MAX_SIZE) {
    throw errors.badRequest(
      `Invalid avatar size. Maximum allowed is ${ALLOWED_AVATAR_MAX_SIZE} MB`,
    );
  }

  const bucket = await storage().bucket();

  const rescalePromises: Promise<Buffer>[] = [];

  AVATAR_VARIANTS.forEach(({ h, w }) => {
    rescalePromises.push(
      sharp(avatar.buffer).resize(w, h).webp({ quality: 60 }).toBuffer(),
    );
  });

  const rescaleBuffers = await Promise.all(rescalePromises);
  const savePromises: Promise<void>[] = [];
  const paths: string[] = [];

  AVATAR_VARIANTS.forEach(({ size }, idx) => {
    const path = `${context.uid}/avatars/${size}`;
    const file = bucket.file(path);
    const buffer = rescaleBuffers[idx];

    savePromises.push(
      file.save(buffer, {
        contentType: `webp`,
      }),
    );
    paths.push(path);
  });

  await Promise.all(savePromises);

  return AVATAR_VARIANTS.reduce<NonNullable<UserProfileModel['avatar']>>(
    (acc, { size, w, h }, idx) => ({
      ...acc,
      [size]: {
        h,
        w,
        ext: `webp`,
        src: `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/${encodeURIComponent(paths[idx])}?alt=media`,
        id: uuid(),
      },
    }),
    {} as NonNullable<UserProfileModel['avatar']>,
  );
};

const updateYourUserProfileHandler = async ({
  context,
  payload,
}: {
  payload: UpdateYourUserProfilePayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UpdateYourUserProfileDto> => {
  const userProfilesRef = context.db.collection(`users-profiles`);
  const yourUserProfileRef = userProfilesRef.doc(context.uid);
  const yourUserProfileSnap = await yourUserProfileRef.get();
  const yourUserProfile = yourUserProfileSnap.data() as
    | UserProfileModel
    | undefined;
  const displayNameSlug =
    payload.profile.displayName !== null
      ? createSlug(payload.profile.displayName)
      : null;

  if (payload.profile.displayName !== null) {
    const hasDuplicates = await userProfilesRef
      .where(`displayNameSlug`, `==`, displayNameSlug)
      .count()
      .get();

    if (hasDuplicates.data().count > 0) {
      throw errors.exists(`User with given display name already exists`);
    }
  }

  if (!yourUserProfile) {
    const cdate = nowISO();

    const newUserProfile: UserProfileModel = {
      id: uuid(),
      cdate,
      mdate: cdate,
      displayName: payload.profile.displayName,
      displayNameSlug,
      bio: payload.profile.bio,
      blogUrl: payload.profile.blogUrl,
      fbUrl: payload.profile.fbUrl,
      githubUrl: payload.profile.githubUrl,
      twitterUrl: payload.profile.twitterUrl,
      linkedInUrl: payload.profile.linkedInUrl,
      avatar: await uploadAvatar({ payload, context }),
    };

    await yourUserProfileRef.set(newUserProfile);

    return {
      mdate: newUserProfile.mdate,
      profile: newUserProfile,
    };
  }

  // await checkIfDisplayNameIsTaken(
  //   auth.uid,
  //   userProfilePayload.displayName,
  //   userProfilesCollection,
  // );
};

export { updateYourUserProfileHandler };
