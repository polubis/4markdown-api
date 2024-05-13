import { https } from 'firebase-functions';
import { errors } from '../core/errors';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import { UploadImagePayload } from '../payloads/images.payload';
import { Image } from '../core/image';
import { UploadImageDto } from '../dtos/image.dto';
import { AuthService } from './auth.service';
import { ImagesRepository } from '../repositories/images.repository';
import { UserProfilePayload } from '../payloads/user-profile.payload';
import {
  IUserProfileEntityAvatar,
  UserProfileEntity,
} from '../entities/user-profile.entity';
import { ImageEntity } from '../entities/img.entity';
import * as sharp from 'sharp';

const UsersService = {
  updateProfile: async (payload: unknown, context: https.CallableContext) => {
    const auth = AuthService.authorize(context);
    const userProfilePayload = UserProfilePayload(payload);
    const userProfilesCollection = admin
      .firestore()
      .collection(`users-profiles`);
    const userProfileDocument = await userProfilesCollection.doc(auth.uid);
    const userProfile = await userProfileDocument.get();

    const manageAvatar = async (data: string) => {
      const avatar = ImageEntity(data);

      if (avatar.extension === `gif`) {
        throw errors.invalidArg(`Invalid extension of avatar`);
      }

      if (avatar.size > 4) {
        throw errors.invalidArg(`Invalid avatar size`);
      }

      const storage = admin.storage();
      const bucket = storage.bucket();
      const [bucketExists] = await bucket.exists();

      if (!bucketExists) {
        throw errors.internal(`Cannot find bucket for avatars`);
      }

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
        const path = `avatars/${auth.uid}/${size}`;
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
          },
        }),
        {} as NonNullable<IUserProfileEntityAvatar>,
      );
    };

    if (!userProfile.exists) {
      const cdate = new Date().toISOString();

      const userProfileNewEntity = UserProfileEntity({
        id: uuid(),
        cdate,
        avatar:
          userProfilePayload.avatar.type === `update`
            ? await manageAvatar(userProfilePayload.avatar.data)
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

      return {};
    }

    const currentUserProfileEntity = userProfile.data();

    if (!UserProfileEntity.is(currentUserProfileEntity)) {
      throw errors.invalidSchema(UserProfileEntity.name);
    }

    if (userProfilePayload.avatar.type === `remove`) {
      const storage = admin.storage();
      const bucket = storage.bucket();
      const [bucketExists] = await bucket.exists();

      if (!bucketExists) {
        throw errors.internal(`Cannot find bucket for avatars`);
      }

      await bucket.file(`avatars/${auth.uid}`).delete();
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
          : await manageAvatar(userProfilePayload.avatar.data),
      displayName: currentUserProfileEntity.displayName,
      bio: userProfilePayload.bio,
      blogUrl: userProfilePayload.blogUrl,
      fbUrl: userProfilePayload.fbUrl,
      githubUrl: userProfilePayload.githubUrl,
      twitterUrl: userProfilePayload.twitterUrl,
      linkedInUrl: userProfilePayload.linkedInUrl,
    });

    await userProfileDocument.set(userProfileNewEntity);

    return {};
  },
  uploadImage: async (
    payload: UploadImagePayload,
    context: https.CallableContext,
  ): Promise<UploadImageDto> => {
    const auth = AuthService.authorize(context);

    const { extension, contentType, buffer } = Image.create(payload.image);
    const storage = admin.storage();
    const bucket = storage.bucket();
    const [bucketExists] = await bucket.exists();

    if (!bucketExists) {
      throw errors.internal(`Cannot find bucket for images`);
    }

    const id = uuid();
    const location = `${auth.uid}/images/${id}`;
    const file = bucket.file(location);

    await file.save(buffer, {
      contentType,
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(location)}?alt=media`;

    await ImagesRepository(auth.uid).create({
      id,
      url,
      contentType,
      extension,
    });

    return {
      extension,
      contentType,
      url,
      id,
    };
  },
};

export { UsersService };
