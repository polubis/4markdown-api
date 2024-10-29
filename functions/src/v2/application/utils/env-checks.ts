const isProd = (projectId: string): boolean =>
  projectId === process.env.PROD_PROJECT_ID;

const isDev = (projectId: string): boolean =>
  projectId === process.env.DEV_PROJECT_ID;

export { isProd, isDev };
