import { protectedController } from '../../utils/controller';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { errors } from '../../utils/errors';

type Dto = void;

// 1. Szyfrowanie maili.
// 2. URL na FE dla Unsub.
// 3. Lepsza protekcja do uzywania tego endpointa - only admin.
// 4. URL variables dla proda?

const sendNewsletterController = protectedController<Dto>(async (_, { db }) => {
  const apiKey = process.env.DEV_EMAILS_PROPAGATION_API_KEY;
  const templateId = process.env.NEWSLETTER_TEMPLATE_ID;

  if (!apiKey || !templateId)
    throw errors.internal(`Problem with mailing setup`);

  const recipients = (
    await db.collection(`newsletter-subscribers`).listDocuments()
  ).map(({ id: email }) => new Recipient(email));

  const mailersend = new MailerSend({
    apiKey,
  });

  const emailParams = new EmailParams()
    .setFrom(new Sender(`newsletter@4markdown.com`, `4markdown`))
    .setTo(recipients)
    .setSubject(`Our Weekly Roundup`)
    .setTemplateId(templateId);

  await mailersend.email.send(emailParams);
});

export { sendNewsletterController };
