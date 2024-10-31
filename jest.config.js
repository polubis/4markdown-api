module.exports = {
  testEnvironment: `node`,
  transform: {
    '^.+\\.[jt]sx?$': `<rootDir>/jest-preprocess.js`,
  },
  setupFilesAfterEnv: [`<rootDir>/setup-test-env.js`],
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$': `identity-obj-proxy`,
    '.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': `<rootDir>/__mocks__/file-mock.js`,
    '^@domain/(.*)$': `<rootDir>/functions/src/v2/domain/$1`,
    '^@libs/(.*)$': `<rootDir>/functions/src/v2/libs/$1`,
    '^@utils/(.*)$': `<rootDir>/functions/src/v2/application/utils/$1`,
    '^@modules/(.*)$': `<rootDir>/functions/src/v2/application/modules/$1`,
    '^@models/(.*)$': `<rootDir>/functions/src/v2/domain/models/$1`,
    '^@schemas/(.*)$': `<rootDir>/functions/src/v2/application/utils/schemas/$1`,
    '^@types/(.*)$': `<rootDir>/functions/src/v2/types/$1`,
    '^@errors/(.*)$': `<rootDir>/functions/src/v2/application/utils/errors/$1`,
    '^@controllers/(.*)$': `<rootDir>/functions/src/v2/application/modules/controllers/$1`,
    '^@validators/(.*)$': `<rootDir>/functions/src/v2/application/utils/validators/$1`,
    '^@helpers/(.*)$': `<rootDir>/functions/src/v2/libs/helpers/$1`,
  },
  testPathIgnorePatterns: [`node_modules`, `\\.cache`, `<rootDir>.*/public`],
  transformIgnorePatterns: [
    `node_modules/(?!(gatsby|gatsby-script|gatsby-link)/)`,
  ],
  globals: {
    __PATH_PREFIX__: ``,
  },
  testEnvironmentOptions: {
    url: `http://localhost`,
  },
  setupFiles: [`<rootDir>/loadershim.js`],
};
