import { protectedController } from '../../utils/controller';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { getEmailsApiKey } from '../../utils/get-emails-api.key';
import { getNewsletterTemplateId } from '../../utils/get-newsletter-template-id';
import { errors } from '../../utils/errors';
import type { Date, Id, Url } from '../../utils/validators';
import type { UserProfileModel } from '../../../domain/models/user-profile';
import type { DocumentModel } from '../../../domain/models/document';
import { getDomainUrl } from '../../utils/get-domain-url';

type Dto = void;

type EmailArticle = {
  url: Url;
  title: string;
  image: Url;
  author: string;
  description: string;
  cdate: Date;
};

// td unsubscribe page
// newsletter page
// avatar broken

const sendNewsletterController = protectedController<Dto>(
  async (_, { db, isAdmin, projectId }) => {
    if (!isAdmin) throw errors.unauthorized();

    const apiKey = getEmailsApiKey();
    const templateId = getNewsletterTemplateId();
    const domainUrl = getDomainUrl(projectId);

    const mailersend = new MailerSend({
      apiKey,
    });

    const [subscribersSnap, documentsSnap, usersProfilesSnap] =
      await Promise.all([
        db.collection(`newsletter-subscribers`).listDocuments(),
        db.collection(`docs`).get(),
        db.collection(`users-profiles`).get(),
      ]);

    const recipients = subscribersSnap.map(
      ({ id: email }) => new Recipient(email),
    );

    const usersProfiles: Record<Id, UserProfileModel> = {};

    usersProfilesSnap.docs.forEach((userSnap) => {
      usersProfiles[userSnap.id] = userSnap.data() as UserProfileModel;
    });

    const articles: EmailArticle[] = [];

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

    articles
      .sort((prev, curr) => {
        if (prev.cdate > curr.cdate) return -1;
        if (prev.cdate === curr.cdate) return 0;
        return 1;
      })
      .slice(0, 5);

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
