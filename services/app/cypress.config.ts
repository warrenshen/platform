import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "nt8kaf",
  chromeWebSecurity: false,
  includeShadowDom: true,

  env: {
    isDocker: true,
    apiServerUrl: "http://localhost:7002",
  },

  reporter: "junit",

  reporterOptions: {
    mochaFile: "cypress/results/output.xml",
  },

  defaultCommandTimeout: 10000,

  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://localhost:3006",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
  },

  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
  },
});
