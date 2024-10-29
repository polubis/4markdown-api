import { type ProjectId } from '../infra/models';
import { errors } from './errors';
import { isDev } from './is-dev';
import { isProd } from './is-prod';
import { type Url } from './validators';

const getDomainUrl = (projectId: ProjectId): Url => {
  const [devDomain, prodDomain] = [
    process.env.DEV_DOMAIN_URL,
    process.env.PROD_DOMAIN_URL,
  ];

  if (!devDomain || !prodDomain)
    throw errors.internal(`Problem with domains setup`);

  if (isDev(projectId)) return devDomain;

  if (isProd(projectId)) return prodDomain;

  throw errors.internal(`Problem with domains setup`);
};

export { getDomainUrl };
