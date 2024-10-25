import { controller } from '../../utils/controller';
import { z } from 'zod';
import { email } from '../../utils/validators';
import { parse } from '../../utils/parse';
import { nowISO } from '../../../libs/helpers/stamps';
import { NewsletterSubscriberModel } from '../../../domain/models/newsletter-subscriber';

const payloadSchema = z.object({
  email,
});

type Dto = void;

const subscribeNewsletterController = controller<Dto>(
  async (rawPayload, { db }) => {
    const payload = await parse(payloadSchema, rawPayload);

    const newsletterSubscribersRef = db
      .collection(`newsletter-subscribers`)
      .doc(payload.email);

    const cdate = nowISO();

    const model: NewsletterSubscriberModel = { cdate };

    await newsletterSubscribersRef.set(model);
  },
);

export { subscribeNewsletterController };
