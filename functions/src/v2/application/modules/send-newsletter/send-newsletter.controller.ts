import { protectedController } from '../../utils/controller';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { getEmailsApiKey } from '../../utils/get-emails-api.key';
import { getNewsletterTemplateId } from '../../utils/get-newsletter-template-id';
import { errors } from '../../utils/errors';
import type { Date, Id, Url } from '../../utils/validators';
import type { UserProfileModel } from '../../../domain/models/user-profile';
import type { DocumentModel } from '../../../domain/models/document';
import { getDomainUrl } from '../../utils/get-domain-url';
import { getEmailsEncryptToken } from '../../utils/get-emails-encrypt-token';
import { decryptEmail } from '../../utils/decrypt-email';

type Dto = void;

type EmailArticle = {
  url: Url;
  title: string;
  image: Url;
  author: string;
  description: string;
  cdate: Date;
};

const sendNewsletterController = protectedController<Dto>(
  async (_, { db, isAdmin, projectId }) => {
    if (!isAdmin) throw errors.unauthorized();

    const [subscribersSnap, documentsSnap, usersProfilesSnap] =
      await Promise.all([
        db.collection(`newsletter-subscribers`).listDocuments(),
        db.collection(`docs`).get(),
        db.collection(`users-profiles`).get(),
      ]);

    const emailsEncryptionToken = getEmailsEncryptToken();

    const decryptedEmails = await Promise.all(
      subscribersSnap.map(({ id: email }) =>
        decryptEmail({
          email,
          iv: emailsEncryptionToken.iv,
          key: emailsEncryptionToken.key,
        }),
      ),
    );

    const recipients = decryptedEmails.map((email) => new Recipient(email));

    const usersProfiles: Record<Id, UserProfileModel> = {};

    usersProfilesSnap.docs.forEach((userSnap) => {
      usersProfiles[userSnap.id] = userSnap.data() as UserProfileModel;
    });

    const articles: EmailArticle[] = [];

    const domainUrl = getDomainUrl(projectId);

    documentsSnap.docs.forEach((documentsListSnap) => {
      const userId = documentsListSnap.id;
      const documentsListData = Object.entries(documentsListSnap.data());

      documentsListData.forEach(([, document]: [Id, DocumentModel]) => {
        if (document.visibility === `permanent`) {
          articles.push({
            url: `${domainUrl}${document.path}`,
            title: document.name,
            description: document.description,
            image: `${domainUrl}/icons/icon-144x144.png`,
            author: usersProfiles[userId].displayName ?? `Gaal (Anonymous)`,
            cdate: document.cdate,
          });
        }
      });
    });

    const articlesLimit = 5;

    articles
      .sort((prev, curr) => {
        if (prev.cdate > curr.cdate) return -1;
        if (prev.cdate === curr.cdate) return 0;
        return 1;
      })
      .slice(0, articlesLimit);

    const emailParams = new EmailParams()
      .setFrom(new Sender(`newsletter@4markdown.com`, `4markdown`))
      .setTo(recipients)
      .setSubject(`Our Weekly Roundup`)
      .setTemplateId(getNewsletterTemplateId())
      .setPersonalization(
        recipients.map(({ email }) => ({
          email,
          data: {
            articles,
          },
        })),
      );

    const mailersend = new MailerSend({
      apiKey: getEmailsApiKey(),
    });

    await mailersend.email.send(emailParams);
  },
);

export { sendNewsletterController };
