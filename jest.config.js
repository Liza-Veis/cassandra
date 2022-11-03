module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['build'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
  },
};
