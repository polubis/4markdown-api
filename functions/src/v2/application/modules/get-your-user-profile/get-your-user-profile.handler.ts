import { type ProtectedControllerHandlerContext } from '@utils/controller';

import {
  type GetYourUserProfileDto,
  type GetYourUserProfilePayload,
} from './get-your-user-profile.contract';
import { UserProfileModel } from '@domain/models/user-profile';

const getYourUserProfileHandler = async ({
  context: { db, uid },
}: {
  payload: GetYourUserProfilePayload;
  context: ProtectedControllerHandlerContext;
}): Promise<GetYourUserProfileDto> => {
  const userProfileSnap = await db.collection(`users-profiles`).doc(uid).get();
  const userProfile = userProfileSnap.data() as UserProfileModel | undefined;

  return userProfile ?? null;
};

export { getYourUserProfileHandler };
