import type { Date, Email } from '../../application/utils/validators';

type NewsletterSubscriberModel = {
  cdate: Date;
};

type NewsletterSubscriberRecord = Record<Email, NewsletterSubscriberModel>;

export type { NewsletterSubscriberModel, NewsletterSubscriberRecord };
