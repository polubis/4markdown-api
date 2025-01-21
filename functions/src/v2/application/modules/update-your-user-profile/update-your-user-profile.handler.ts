import { type ProtectedControllerHandlerContext } from '@utils/controller';

import {
  type UpdateYourUserProfileDto,
  type UpdateYourUserProfilePayload,
} from './update-your-user-profile.contract';

const updateYourUserProfileHandler = async ({
  context,
}: {
  payload: UpdateYourUserProfilePayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UpdateYourUserProfileDto> => {};

export { updateYourUserProfileHandler };
