import { protectedController } from '../../utils/controller';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { errors } from '../../utils/errors';

type Dto = void;

const sendNewsletterController = protectedController<Dto>(async () => {
  const apiKey = process.env.EMAILS_PROPAGATION_API_KEY;

  if (!apiKey) throw errors.internal(`Problem with mailing setup`);

  const mailersend = new MailerSend({
    apiKey,
  });

  const recipients = [
    new Recipient(`adrian.polubinski.work@gmail.com`, `Test`),
  ];

  const emailParams = new EmailParams()
    .setFrom(new Sender(`4markdown@gmail.com`, `4markdown`))
    .setTo(recipients)
    .setSubject(`Subject`)
    .setTemplateId(`yzkq340wj6kgd796`);

  await mailersend.email.send(emailParams);
});

export { sendNewsletterController };
