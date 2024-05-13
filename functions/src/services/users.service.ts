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
  IUserProfileAvatarSizeVariant,
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

    const manageAvatar = async () => {
      if (userProfilePayload.avatar.type === `noop`) {
        return;
      }

      if (userProfilePayload.avatar.type === `update`) {
        const avatar = ImageEntity(userProfilePayload.avatar.data);

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

        const sizesLookup: Record<
          IUserProfileAvatarSizeVariant,
          [number, number]
        > = {
          lg: [100, 100],
          md: [64, 64],
          sm: [32, 32],
          tn: [24, 24],
        };

        let userProfileAvatars = {} as Record<
          IUserProfileAvatarSizeVariant,
          NonNullable<IUserProfileEntityAvatar>
        >;
        const rescalePromises: Promise<Buffer>[] = [];

        Object.entries(sizesLookup).forEach(([size, [w, h]]) => {
          const path = `avatars/${auth.uid}/${size}`;
          const src = `https://firebasestorage.googleapis.com/v0/b/${
            bucket.name
          }/o/${encodeURIComponent(path)}?alt=media`;

          userProfileAvatars = {
            ...userProfileAvatars,
            [size]: {
              src,
              ext: `webp`,
              h,
              w,
            },
          };

          rescalePromises.push(
            sharp(avatar.buffer).resize(w, h).webp({ quality: 70 }).toBuffer(),
          );
        });

        await Promise.all(rescalePromises);

        // const recalculateAvatarPromises: Promise<Buffer>[] = [];
        // const uploadPaths: string[] = [];

        // Object.entries(sizeLookup).forEach(([size, [width, height]]) => {
        //   recalculateAvatarPromises.push(
        //     sharp(avatar.buffer)
        //       .resize(width, height)
        //       .webp({ quality: 70 })
        //       .toBuffer(),
        //   );
        //   uploadPaths.push(`avatars/${auth.uid}/${size}`);
        // });

        // const recalculatedAvatarsBuffers = await Promise.all(
        //   recalculateAvatarPromises,
        // );
        // const savePromises: Promise<void>[] = [];
        // const result = [];

        // uploadPaths.forEach((path, idx) => {
        //   const file = bucket.file(path);
        //   const buffer = recalculatedAvatarsBuffers[idx];
        //   savePromises.push(
        //     file.save(buffer, {
        //       contentType: `webp`,
        //     }),
        //   );
        // });

        // await Promise.all(savePromises);

        // const userProfileAvatars = {};

        // Object.entries(sizeLookup).forEach(() => {});

        // return userProfileAvatars;
      }
    };

    if (!userProfile.exists) {
      const cdate = new Date().toISOString();

      const userProfileNewEntity = UserProfileEntity({
        id: uuid(),
        cdate,
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

    const userProfileNewEntity = UserProfileEntity({
      id: currentUserProfileEntity.id,
      cdate: currentUserProfileEntity.cdate,
      mdate: new Date().toISOString(),
      avatar: null,
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
