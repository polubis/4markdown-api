import { protectedController } from '../../utils/controller';
import { z } from 'zod';
import { email } from '../../utils/validators';
import { parse } from '../../utils/parse';

const payloadSchema = z.object({
  email,
});

type Dto = {};

const subscribeNewsletterController = protectedController<Dto>(
  async (rawPayload, { uid, db }) => {
    const payload = await parse(payloadSchema, rawPayload);

    const ref = db.collection(`newsletter-subscribers`);

    return {};
  },
);

export { subscribeNewsletterController };
