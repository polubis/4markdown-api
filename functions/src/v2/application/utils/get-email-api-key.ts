import { isDev, isProd } from './env-checks';
import { errors } from './errors';

const getEmailAPIKey = (projectId: string): string => {
  let apiKey: string | undefined;

  if (isProd(projectId)) {
    apiKey = process.env.PROD_EMAILS_PROPAGATION_API_KEY;
  } else if (isDev(projectId)) {
    apiKey = process.env.DEV_EMAILS_PROPAGATION_API_KEY;
  }

  if (!apiKey) throw errors.internal(`Problem with propagation mailing setup`);

  return apiKey;
};

export { getEmailAPIKey };
