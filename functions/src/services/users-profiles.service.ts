import { https } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import { AuthService } from './auth.service';
import {
  IUserProfilePayload,
  UserProfilePayload,
} from '../payloads/user-profile.payload';
import {
  IUserProfileEntity,
  IUserProfileEntityAvatar,
  UserProfileEntity,
} from '../entities/user-profile.entity';
import { ImageEntity } from '../entities/img.entity';
import * as sharp from 'sharp';
import { IUserProfileDto } from '../dtos/users-profiles.dto';
import { Id } from '../entities/general';
import { errors } from '../v2/application/utils/errors';
import { CallableRequest } from 'firebase-functions/https';

const sizes = [
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

const createProfileDtoShape = (e: IUserProfileEntity): IUserProfileDto => ({
  profile: {
    id: e.id,
    avatar: e.avatar,
    displayName: e.displayName,
    bio: e.bio,
    blogUrl: e.blogUrl,
    fbUrl: e.fbUrl,
    githubUrl: e.githubUrl,
    twitterUrl: e.twitterUrl,
    linkedInUrl: e.linkedInUrl,
  },
  mdate: e.mdate,
});

const getBucket = async () => {
  const storage = admin.storage();
  const bucket = storage.bucket();
  const [bucketExists] = await bucket.exists();

  if (!bucketExists) {
    throw errors.internal(`Cannot find bucket for avatars`);
  }

  return bucket;
};

const rescaleAndUploadAvatars = async (uid: string, data: string) => {
  const avatar = ImageEntity(data);

  if (avatar.extension === `gif`) {
    throw errors.badRequest(`Invalid extension of avatar`);
  }

  if (avatar.size > 4) {
    throw errors.badRequest(`Invalid avatar size`);
  }

  const bucket = await getBucket();

  const rescalePromises: Promise<Buffer>[] = [];

  sizes.forEach(({ h, w }) => {
    rescalePromises.push(
      sharp(avatar.buffer).resize(w, h).webp({ quality: 70 }).toBuffer(),
    );
  });

  const rescaleBuffers = await Promise.all(rescalePromises);
  const savePromises: Promise<void>[] = [];
  const paths: string[] = [];

  sizes.forEach(({ size }, idx) => {
    const path = `${uid}/avatars/${size}`;
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

  return sizes.reduce<NonNullable<IUserProfileEntityAvatar>>(
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
    {} as NonNullable<IUserProfileEntityAvatar>,
  );
};

const checkIfDisplayNameIsTaken = async (
  uid: Id,
  displayName: IUserProfilePayload['displayName'],
  collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>,
): Promise<void> => {
  if (displayName === null) return;

  const snapshot = await collection.get();

  if (snapshot.empty) return;

  snapshot.forEach((doc) => {
    if (doc.id === uid) return;

    const data = doc.data() as IUserProfileEntity;

    if (data.displayName === displayName) {
      throw errors.exists(`This display name is already taken by other user`);
    }
  });
};

const UsersProfilesService = {
  getYour: async (
    context: https.CallableContext,
  ): Promise<IUserProfileDto | null> => {
    const auth = AuthService.authorize(context);
    const userProfilesCollection = admin
      .firestore()
      .collection(`users-profiles`);
    const userProfileDocument = await userProfilesCollection.doc(auth.uid);
    const userProfile = await userProfileDocument.get();

    if (!userProfile.exists) {
      return null;
    }

    const userProfileEntity = userProfile.data() as IUserProfileEntity;

    return createProfileDtoShape(userProfileEntity);
  },
  updateYour: async ({
    payload,
    context,
  }: {
    payload: unknown;
    context: Pick<CallableRequest<unknown>, 'auth'>;
  }): Promise<IUserProfileDto> => {
    const auth = AuthService.authorize(context);
    const userProfilePayload = UserProfilePayload(payload);

    const userProfilesCollection = admin
      .firestore()
      .collection(`users-profiles`);

    await checkIfDisplayNameIsTaken(
      auth.uid,
      userProfilePayload.displayName,
      userProfilesCollection,
    );

    const userProfileDocument = await userProfilesCollection.doc(auth.uid);
    const userProfile = await userProfileDocument.get();

    if (!userProfile.exists) {
      const cdate = new Date().toISOString();

      const userProfileNewEntity = UserProfileEntity({
        id: uuid(),
        cdate,
        avatar:
          userProfilePayload.avatar.type === `update`
            ? await rescaleAndUploadAvatars(
                auth.uid,
                userProfilePayload.avatar.data,
              )
            : null,
        mdate: cdate,
        displayName: userProfilePayload.displayName,
        bio: userProfilePayload.bio,
        blogUrl: userProfilePayload.blogUrl,
        fbUrl: userProfilePayload.fbUrl,
        githubUrl: userProfilePayload.githubUrl,
        twitterUrl: userProfilePayload.twitterUrl,
        linkedInUrl: userProfilePayload.linkedInUrl,
      });

      await userProfileDocument.set(userProfileNewEntity);

      return createProfileDtoShape(userProfileNewEntity);
    }

    const currentUserProfileEntity = userProfile.data();

    if (!UserProfileEntity.is(currentUserProfileEntity)) {
      throw errors.badRequest(`The schema is not typeof UserProfileEntity`);
    }

    if (userProfilePayload.mdate !== currentUserProfileEntity.mdate) {
      throw errors.outOfDate(
        `You cannot edit profile. You've changed it on another device.`,
      );
    }

    if (userProfilePayload.avatar.type === `remove`) {
      const bucket = await getBucket();
      const deletePromises = sizes.map(({ size }) =>
        bucket.file(`${auth.uid}/avatars/${size}`).delete(),
      );

      await deletePromises;
    }

    const userProfileNewEntity = UserProfileEntity({
      id: currentUserProfileEntity.id,
      cdate: currentUserProfileEntity.cdate,
      mdate: new Date().toISOString(),
      avatar:
        userProfilePayload.avatar.type === `noop`
          ? currentUserProfileEntity.avatar
          : userProfilePayload.avatar.type === `remove`
          ? null
          : await rescaleAndUploadAvatars(
              auth.uid,
              userProfilePayload.avatar.data,
            ),
      displayName: userProfilePayload.displayName,
      bio: userProfilePayload.bio,
      blogUrl: userProfilePayload.blogUrl,
      fbUrl: userProfilePayload.fbUrl,
      githubUrl: userProfilePayload.githubUrl,
      twitterUrl: userProfilePayload.twitterUrl,
      linkedInUrl: userProfilePayload.linkedInUrl,
    });

    await userProfileDocument.set(userProfileNewEntity);

    return createProfileDtoShape(userProfileNewEntity);
  },
};

export { UsersProfilesService };
