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

const updateYourUserProfileHandler = async ({
  context,
  payload,
}: {
  payload: UpdateYourUserProfilePayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UpdateYourUserProfileDto> => {
  const userDisplayNamesRef = context.db.collection(`user-display-names`);
  const userProfilesRef = context.db.collection(`users-profiles`);
  const yourUserProfileRef = userProfilesRef.doc(context.uid);

  const uploadAvatar = async ({
    base64Avatar,
  }: {
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

    if (avatar.size > allowedMaxSize) {
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

  const checkForNamesDuplication = async (
    transaction: Transaction,
  ): Promise<void> => {
    if (payload.profile.displayName === null) return;

    const userDisplayNamesSnap = await transaction.get(
      userDisplayNamesRef
        .where(`__name__`, `==`, payload.profile.displayName)
        .where(`userId`, `!=`, context.uid)
        .count(),
    );

    if (userDisplayNamesSnap.data().count > 0)
      throw errors.exists(`User with given display name already exists`);
  };

  return await context.db.runTransaction(async (transaction) => {
    await checkForNamesDuplication(transaction);

    const yourUserProfileSnap = await yourUserProfileRef.get();
    const yourUserProfile = yourUserProfileSnap.data() as
      | UserProfileModel
      | undefined;
    const displayNameSlug =
      payload.profile.displayName !== null
        ? createSlug(payload.profile.displayName)
        : null;
    const cdate = nowISO();

    if (!yourUserProfile) {
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
        avatar:
          payload.profile.avatar.type === `update`
            ? await uploadAvatar({
                base64Avatar: payload.profile.avatar.data,
              })
            : null,
      };

      await yourUserProfileRef.set(newUserProfile);

      return {
        mdate: newUserProfile.mdate,
        profile: newUserProfile,
      };
    }

    if (payload.mdate !== yourUserProfile.mdate) {
      throw errors.outOfDate(
        `You cannot edit profile. You've changed it on another device.`,
      );
    }

    if (payload.profile.avatar.type === `remove`) {
      const bucket = await storage().bucket();

      await Promise.all(
        avatarVariants.map(({ size }) =>
          bucket.file(`${context.uid}/avatars/${size}`).delete(),
        ),
      );
    }

    const updatedUserProfile: Omit<UserProfileModel, `id` | `cdate`> = {
      mdate: nowISO(),
      displayName: payload.profile.displayName,
      displayNameSlug,
      bio: payload.profile.bio,
      blogUrl: payload.profile.blogUrl,
      fbUrl: payload.profile.fbUrl,
      githubUrl: payload.profile.githubUrl,
      twitterUrl: payload.profile.twitterUrl,
      linkedInUrl: payload.profile.linkedInUrl,
      avatar:
        payload.profile.avatar.type === `noop`
          ? yourUserProfile.avatar
          : payload.profile.avatar.type === `remove`
          ? null
          : await uploadAvatar({ base64Avatar: payload.profile.avatar.data }),
    };

    await yourUserProfileRef.update(updatedUserProfile);

    return {
      mdate: updatedUserProfile.mdate,
      profile: {
        ...updatedUserProfile,
        id: yourUserProfile.id,
        cdate: yourUserProfile.cdate,
      },
    };
  });
};

export { updateYourUserProfileHandler };
