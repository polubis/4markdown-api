import { https } from 'firebase-functions';
import { errors } from '../core/errors';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import { UploadImagePayload } from '../payloads/images.payload';
import { Image } from '../core/image';
import { UploadImageDto } from '../dtos/image.dto';
import { AuthService } from './auth.service';
import { ImagesRepository } from '../repositories/images.repository';
import { UserProfileEntity } from '../entities/users-profiles.entity';
import { UserProfilePayload } from '../payloads/user-profile.payload';

const UsersService = {
  updateProfile: async (payload: unknown, context: https.CallableContext) => {
    const auth = AuthService.authorize(context);
    const {
      displayName,
      bio,
      blogUrl,
      fbUrl,
      githubUrl,
      linkedInUrl,
      avatar: avatarAction,
      twitterUrl,
    } = UserProfilePayload(payload);
    const collection = admin.firestore().collection(`users`);
    const document = await collection.doc(auth.uid);
    const profile = await document.get();

    if (!profile.exists) {
      const cdate = new Date().toISOString();

      const entity: UserProfileEntity = {
        id: uuid(),
        cdate,
        mdate: cdate,
        avatar: null,
        displayName,
        bio,
        blogUrl,
        fbUrl,
        githubUrl,
        twitterUrl,
        linkedInUrl,
      };

      await document.set(entity);

      return {};
    }

    const profileData = profile.data() as UserProfileEntity;

    const entity: UserProfileEntity = {
      id: profileData.id,
      cdate: profileData.cdate,
      mdate: new Date().toISOString(),
      avatar: null,
      displayName,
      bio,
      blogUrl,
      fbUrl,
      githubUrl,
      twitterUrl,
      linkedInUrl,
    };

    await document.set(entity);

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
