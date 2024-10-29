import { errors } from './errors';

const getEmailsApiKey = (): string => {
  const key = process.env.EMAILS_API_KEY;

  if (!key) throw errors.internal(`Problem with propagation mailing setup`);

  return key;
};

export { getEmailsApiKey };
