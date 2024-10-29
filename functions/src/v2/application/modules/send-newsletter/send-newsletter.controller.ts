import { protectedController } from '../../utils/controller';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { getEmailsApiKey } from '../../utils/get-emails-api.key';
import { getNewsletterTemplateId } from '../../utils/get-newsletter-template-id';
import { errors } from '../../utils/errors';

type Dto = void;

// 2. URL na FE dla Unsub.
// 5. Fix personalization

const sendNewsletterController = protectedController<Dto>(
  async (_, { db, isAdmin }) => {
    if (!isAdmin) throw errors.unauthorized();

    const apiKey = getEmailsApiKey();
    const templateId = getNewsletterTemplateId();

    const recipients = (
      await db.collection(`newsletter-subscribers`).listDocuments()
    ).map(({ id: email }) => new Recipient(email));

    const mailersend = new MailerSend({
      apiKey,
    });

    const articles = [
      {
        url: ``,
        image: ``,
        title: `XD`,
        description: `XD`,
        author: `XD`,
      },
    ];

    const emailParams = new EmailParams()
      .setFrom(new Sender(`newsletter@4markdown.com`, `4markdown`))
      .setTo(recipients)
      .setSubject(`Our Weekly Roundup`)
      .setTemplateId(templateId)
      .setPersonalization(
        recipients.map(({ email }) => ({
          email,
          data: {
            articles,
          },
        })),
      );

    await mailersend.email.send(emailParams);
  },
);

export { sendNewsletterController };
