import { protectedController } from '../../utils/controller';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { errors } from '../../utils/errors';
import { getEmailAPIKey } from '../../utils/get-email-api-key';

type Dto = void;

// 2. URL na FE dla Unsub.
// 3. Lepsza protekcja do uzywania tego endpointa - only admin.
// 5. Fix personalization

const sendNewsletterController = protectedController<Dto>(
  async (_, { db, projectId }) => {
    const apiKey = getEmailAPIKey(projectId);
    const templateId = process.env.NEWSLETTER_TEMPLATE_ID;
    // @TODO[PRIO=2]: [Move these checks to setup stage, not runtime].
    if (!templateId)
      throw errors.internal(`Problem with template mailing setup`);

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
  },
);

export { sendNewsletterController };
