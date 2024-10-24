import { controller } from '../../utils/controller';
import { z } from 'zod';
import { parse } from '../../utils/parse';
import { email } from '../../utils/validators';

const payloadSchema = z.object({
  email,
});

type Dto = {};

const unsubscribeNewsletterController = controller<Dto>(
  async (rawPayload, { db }) => {
    const payload = await parse(payloadSchema, rawPayload);

    const newsletterSubscribersRef = db
      .collection(`newsletter-subscribers`)
      .doc(payload.email);

    await newsletterSubscribersRef.delete();

    return {};
  },
);

export { unsubscribeNewsletterController };
