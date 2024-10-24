import { controller } from '../../utils/controller';
import { z } from 'zod';
import { email } from '../../utils/validators';
import { parse } from '../../utils/parse';
import { nowISO } from '../../../libs/helpers/stamps';
import { errors } from '../../utils/errors';
import { encrypt } from '../../utils/encrypt';

const payloadSchema = z.object({
  email,
});

type Dto = void;

const subscribeNewsletterController = controller<Dto>(
  async (rawPayload, { db }) => {
    const emailsKey = process.env.EMAILS_KEY;

    if (!emailsKey)
      throw errors.internal(`Problem with subscribe to newsletter setup`);

    const payload = await parse(payloadSchema, rawPayload);

    const encryption = encrypt({ key: emailsKey, data: payload.email });

    const newsletterSubscribersRef = db
      .collection(`newsletter-subscribers`)
      .doc(encryption.value);

    const cdate = nowISO();

    await newsletterSubscribersRef.set({ cdate, iv: encryption.iv });
  },
);

export { subscribeNewsletterController };
