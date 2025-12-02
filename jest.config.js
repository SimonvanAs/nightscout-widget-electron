/** @type {import('jest').Config} */

const config = {
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  verbose: true,
  testEnvironment: "jsdom",
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ]
};

export default config;
