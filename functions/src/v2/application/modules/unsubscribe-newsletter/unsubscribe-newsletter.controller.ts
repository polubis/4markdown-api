import { controller } from '../../utils/controller';
import { z } from 'zod';
import { parse } from '../../utils/parse';
import { email } from '../../utils/validators';
import { encryptEmail } from '../../utils/encrypt-email';
import { getEmailsEncryptToken } from '../../utils/get-emails-encrypt-token';

const payloadSchema = z.object({
  email,
});

type Dto = void;

const unsubscribeNewsletterController = controller<Dto>(
  async (rawPayload, { db }) => {
    const { email } = await parse(payloadSchema, rawPayload);

    const emailsEncryptionToken = getEmailsEncryptToken();

    const encryptedEmail = await encryptEmail({
      key: emailsEncryptionToken.key,
      iv: emailsEncryptionToken.iv,
      email,
    });

    const newsletterSubscribersRef = db
      .collection(`newsletter-subscribers`)
      .doc(encryptedEmail);

    await newsletterSubscribersRef.delete();
  },
);

export { unsubscribeNewsletterController };
