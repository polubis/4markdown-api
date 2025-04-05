module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@controllers/(.*)$': '<rootDir>/src/v2/application/modules/controllers/$1',
    '^@database/(.*)$': '<rootDir>/src/v2/application/database/$1',
    '^@domain/(.*)$': '<rootDir>/src/v2/domain/$1',
    '^@libs/(.*)$': '<rootDir>/src/v2/libs/$1',
    '^@models/(.*)$': '<rootDir>/src/v2/domain/models/$1',
    '^@modules/(.*)$': '<rootDir>/src/v2/application/modules/$1',
    '^@utils/(.*)$': '<rootDir>/src/v2/application/utils/$1',
  }
}; 