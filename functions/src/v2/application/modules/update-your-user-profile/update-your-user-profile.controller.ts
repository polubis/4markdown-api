import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  type UpdateYourUserProfileDto,
  updateYourUserProfilePayloadSchema,
} from './update-your-user-profile.contract';
import { updateYourUserProfileHandler } from './update-your-user-profile.handler';

const updateYourUserProfileController =
  protectedController<UpdateYourUserProfileDto>(async (rawPayload, context) => {
    return await updateYourUserProfileHandler({
      context,
      payload: await parse(updateYourUserProfilePayloadSchema, rawPayload),
    });
  });

export { updateYourUserProfileController };
