import { type UserProfileModel } from '@domain/models/user-profile';
import { z } from 'zod';

const getYourUserProfilePayloadSchema = z.null();

type GetYourUserProfilePayload = z.infer<
  typeof getYourUserProfilePayloadSchema
>;

type GetYourUserProfileDto = {
  mdate: UserProfileModel['mdate'];
  profile: UserProfileModel;
} | null;

export { getYourUserProfilePayloadSchema };
export type { GetYourUserProfileDto, GetYourUserProfilePayload };
