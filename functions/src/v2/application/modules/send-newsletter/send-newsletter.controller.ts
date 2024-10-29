import { protectedController } from '../../utils/controller';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { getEmailsApiKey } from '../../utils/get-emails-api.key';
import { getNewsletterTemplateId } from '../../utils/get-newsletter-template-id';
import { errors } from '../../utils/errors';
import type { Id } from '../../utils/validators';
import type { UserProfileModel } from '../../../domain/models/user-profile';
import type { DocumentModel } from '../../../domain/models/document';

type Dto = void;

// 2. URL na FE dla Unsub.

type EmailArticle = {
  url: string;
  name: string;
  image: string;
  author: string;
  description: string;
  cdate: string;
};

const sendNewsletterController = protectedController<Dto>(
  async (_, { db, isAdmin }) => {
    if (!isAdmin) throw errors.unauthorized();

    const apiKey = getEmailsApiKey();
    const templateId = getNewsletterTemplateId();

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
            url: `https://4markdown.com${document.path}`,
            name: document.name,
            description: document.description,
            image: document.visibility,
            author: usersProfiles[userId].displayName ?? `Anonymous`,
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
      .splice(0, 5);

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
