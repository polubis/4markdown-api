import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  GetYourUserProfileDto,
  getYourUserProfilePayloadSchema,
} from './get-your-user-profile.contract';
import { getYourUserProfileHandler } from './get-your-user-profile.handler';

const getYourUserProfileController = protectedController<GetYourUserProfileDto>(
  async (rawPayload, context) => {
    return await getYourUserProfileHandler({
      context,
      payload: await parse(getYourUserProfilePayloadSchema, rawPayload),
    });
  },
);

export { getYourUserProfileController };
