import { https } from 'firebase-functions';
import { errors } from '../core/errors';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import { UploadImagePayload } from '../payloads/images.payload';
import { Image } from '../core/image';
import { UploadImageDto } from '../dtos/image.dto';
import { AuthService } from './auth.service';
import { ImagesRepository } from '../repositories/images.repository';
import {
  createUserProfileEntity,
  isUserProfileEntity,
} from '../entities/user-profile.entity';
import { createUserProfilePayload } from '../payloads/user-profile.payload';

const UsersService = {
  updateProfile: async (payload: unknown, context: https.CallableContext) => {
    const auth = AuthService.authorize(context);
    const userProfilePayload = createUserProfilePayload(payload);
    const userProfilesCollection = admin
      .firestore()
      .collection(`users-profiles`);
    const userProfileDocument = await userProfilesCollection.doc(auth.uid);
    const userProfile = await userProfileDocument.get();

    if (!userProfile.exists) {
      const cdate = new Date().toISOString();
      const userProfileNewEntity = createUserProfileEntity({
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

    const currentUserProfileEntity = isUserProfileEntity(userProfile.data());

    if (!isUserProfileEntity(currentUserProfileEntity)) {
      throw errors.internal(
        `Retreived UserProfileEntity is not type of UserProfileEntity`,
      );
    }

    const userProfileNewEntity = createUserProfileEntity({
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
