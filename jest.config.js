/** @type {import('jest').Config} */

const config = {
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  verbose: false,
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  testEnvironment: "jsdom"
};

module.exports = config;
