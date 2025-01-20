import { type ProtectedControllerHandlerContext } from '@utils/controller';
import {
  GetYourUserProfileDto,
  GetYourUserProfilePayload,
} from './get-your-user-profile.contract';
import { UserProfileModel } from '@domain/models/user-profile';

const getYourUserProfileHandler = async ({
  context,
}: {
  payload: GetYourUserProfilePayload;
  context: ProtectedControllerHandlerContext;
}): Promise<GetYourUserProfileDto> => {
  const ref = context.db.collection(`users-profiles`).doc(context.uid);
  const snap = await ref.get();
  const profile = snap.data() as UserProfileModel | undefined;

  if (!profile) return null;

  return {
    profile,
    mdate: profile.mdate,
  };
};

export { getYourUserProfileHandler };
