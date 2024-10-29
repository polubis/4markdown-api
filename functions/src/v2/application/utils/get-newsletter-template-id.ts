import { errors } from './errors';

const getNewsletterTemplateId = (): string => {
  const key = process.env.NEWSLETTER_TEMPLATE_ID;

  if (!key) throw errors.internal(`Problem with template mailing setup`);

  return key;
};

export { getNewsletterTemplateId };
