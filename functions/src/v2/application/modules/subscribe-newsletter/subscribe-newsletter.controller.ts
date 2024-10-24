import { controller } from '../../utils/controller';
import { z } from 'zod';
import { type Date, email } from '../../utils/validators';
import { parse } from '../../utils/parse';
import { nowISO } from '../../../libs/helpers/stamps';

const payloadSchema = z.object({
  email,
});

type Dto = {
  cdate: Date;
};

const subscribeNewsletterController = controller<Dto>(
  async (rawPayload, { db }) => {
    const payload = await parse(payloadSchema, rawPayload);

    const newsletterSubscribersRef = db
      .collection(`newsletter-subscribers`)
      .doc(payload.email);

    const cdate = nowISO();

    await newsletterSubscribersRef.set({ cdate });

    return { cdate };
  },
);

export { subscribeNewsletterController };
