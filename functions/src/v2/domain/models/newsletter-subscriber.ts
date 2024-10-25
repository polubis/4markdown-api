import type { Date, Email, Id } from '../../application/utils/validators';

type NewsletterSubscriberModel = {
  cdate: Date;
  id: Id;
};

type NewsletterSubscriberRecord = Record<Email, NewsletterSubscriberModel>;

export type { NewsletterSubscriberModel, NewsletterSubscriberRecord };
