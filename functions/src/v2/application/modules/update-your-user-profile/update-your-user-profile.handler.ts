import { type ProtectedControllerHandlerContext } from '@utils/controller';
import {
  type UpdateYourUserProfileDto,
  type UpdateYourUserProfilePayload,
} from './update-your-user-profile.contract';
import { errors } from '@utils/errors';
import { type Transaction } from 'firebase-admin/firestore';
import { createSlug } from '@utils/create-slug';
import { type UserProfileModel } from '@domain/models/user-profile';
import { nowISO, uuid } from '@libs/helpers/stamps';
import { type Base64 } from '@utils/validators';
import { decodeBase64Asset } from '@utils/decode-base64-asset';
import { storage } from 'firebase-admin';
import * as sharp from 'sharp';
import { toUnit } from '@libs/helpers/to-unit';

type UpdateYourUserProfileHandlerConfig = {
  payload: UpdateYourUserProfilePayload;
  context: ProtectedControllerHandlerContext;
};

const avatarVariants = [
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

const verifyDisplayNamesDuplication = async ({
  transaction,
  context,
  displayNameSlug,
}: {
  context: ProtectedControllerHandlerContext;
  transaction: Transaction;
  displayNameSlug: UserProfileModel['displayNameSlug'];
}): Promise<void> => {
  if (displayNameSlug === null) return;

  const userDisplayNamesSnap = await transaction.get(
    context.db
      .collection(`users-profiles`)
      .where(`displayNameSlug`, `==`, displayNameSlug)
      .where(`__name__`, `!=`, context.uid),
  );

  if (userDisplayNamesSnap.size > 0)
    throw errors.exists(`User with given display name already exists`);
};

const uploadAvatar = async ({
  base64Avatar,
  context,
}: {
  context: ProtectedControllerHandlerContext;
  base64Avatar: Base64;
}): Promise<UserProfileModel['avatar']> => {
  const allowedExtensions = [`png`, `jpeg`, `webp`, `jpg`];
  const allowedMaxSize = 4;

  const avatar = decodeBase64Asset(base64Avatar);

  if (!allowedExtensions.includes(avatar.extension)) {
    throw errors.badRequest(
      `Invalid extension of avatar. Only ${allowedExtensions.join(
        `, `,
      )} are supported`,
    );
  }

  if (toUnit(avatar.size, `mb`) > allowedMaxSize) {
    throw errors.badRequest(
      `Invalid avatar size. Maximum allowed is ${allowedMaxSize} MB`,
    );
  }

  const bucket = await storage().bucket();

  const rescalePromises: Promise<Buffer>[] = [];

  avatarVariants.forEach(({ h, w }) => {
    rescalePromises.push(
      sharp(avatar.buffer).resize(w, h).webp({ quality: 60 }).toBuffer(),
    );
  });

  const rescaleBuffers = await Promise.all(rescalePromises);
  const savePromises: Promise<void>[] = [];
  const paths: string[] = [];

  avatarVariants.forEach(({ size }, idx) => {
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

  return avatarVariants.reduce<NonNullable<UserProfileModel['avatar']>>(
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

const removeAvatar = async ({
  context,
}: {
  context: ProtectedControllerHandlerContext;
}) => {
  const bucket = await storage().bucket();

  await Promise.all(
    avatarVariants.map(({ size }) =>
      bucket.file(`${context.uid}/avatars/${size}`).delete(),
    ),
  );
};

const updateYourUserProfileHandler = async ({
  context,
  payload,
}: UpdateYourUserProfileHandlerConfig): Promise<UpdateYourUserProfileDto> => {
  const yourUserProfileRef = context.db
    .collection(`users-profiles`)
    .doc(context.uid);

  return await context.db.runTransaction(async (transaction) => {
    const displayNameSlug =
      payload.displayName !== null ? createSlug(payload.displayName) : null;

    await verifyDisplayNamesDuplication({
      transaction,
      displayNameSlug,
      context,
    });

    const yourUserProfileSnap = await transaction.get(yourUserProfileRef);

    const userProfilePartial: Omit<
      UserProfileModel,
      'id' | 'cdate' | 'mdate' | 'avatar'
    > = {
      displayNameSlug,
      displayName: payload.displayName,
      bio: payload.bio,
      linkedInUrl: payload.linkedInUrl,
      githubUrl: payload.githubUrl,
      fbUrl: payload.fbUrl,
      blogUrl: payload.blogUrl,
      twitterUrl: payload.twitterUrl,
    };
    const now = nowISO();

    const yourUserProfile = yourUserProfileSnap.data() as
      | UserProfileModel
      | undefined;

    if (!yourUserProfile) {
      const newUserProfile: UserProfileModel = {
        ...userProfilePartial,
        id: uuid(),
        cdate: now,
        mdate: now,
        avatar:
          payload.avatar.type === `update`
            ? await uploadAvatar({
                base64Avatar: payload.avatar.data,
                context,
              })
            : null,
      };

      await transaction.create(yourUserProfileRef, newUserProfile);

      return {
        mdate: newUserProfile.mdate,
        profile: newUserProfile,
      };
    }

    if (payload.mdate !== null && payload.mdate !== yourUserProfile.mdate) {
      throw errors.outOfDate(
        `Profile cannot be updated. Please refresh and try again (the profile may have been modified on another device or session)`,
      );
    }

    if (payload.avatar.type === `remove`) {
      await removeAvatar({ context });
    }

    const updatedYourUserProfile: UserProfileModel = {
      ...userProfilePartial,
      id: yourUserProfile.id,
      cdate: yourUserProfile.cdate,
      mdate: now,
      avatar:
        payload.avatar.type === `noop`
          ? yourUserProfile.avatar
          : payload.avatar.type === `remove`
          ? null
          : await uploadAvatar({
              base64Avatar: payload.avatar.data,
              context,
            }),
    };

    await transaction.update(yourUserProfileRef, updatedYourUserProfile);

    return {
      mdate: now,
      profile: updatedYourUserProfile,
    };
  });
};

export { updateYourUserProfileHandler };
