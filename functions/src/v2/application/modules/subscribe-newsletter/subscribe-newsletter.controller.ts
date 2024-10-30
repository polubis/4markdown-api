import { controller } from '../../utils/controller';
import { z } from 'zod';
import { email } from '../../utils/validators';
import { parse } from '../../utils/parse';
import { nowISO, uuid } from '../../../libs/helpers/stamps';
import { NewsletterSubscriberModel } from '../../../domain/models/newsletter-subscriber';
import { getEmailsEncryptToken } from '../../utils/get-emails-encrypt-token';
import { encryptEmail } from '../../utils/encrypt-email';

const payloadSchema = z.object({
  email,
});

type Dto = void;

const subscribeNewsletterController = controller<Dto>(
  async (rawPayload, { db }) => {
    const { email } = await parse(payloadSchema, rawPayload);

    const { key, iv } = getEmailsEncryptToken();

    const encryptedEmail = await encryptEmail({
      key,
      iv,
      email,
    });

    const newsletterSubscribersRef = db
      .collection(`newsletter-subscribers`)
      .doc(encryptedEmail);

    const model: NewsletterSubscriberModel = {
      cdate: nowISO(),
      id: uuid(),
    };

    await newsletterSubscribersRef.set(model);
  },
);

export { subscribeNewsletterController };
