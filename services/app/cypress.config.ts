import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "nt8kaf",
  chromeWebSecurity: false,
  includeShadowDom: true,
  // We cap to 5 to prevent Chromium from crashing when we run all specs at once.
  numTestsKeptInMemory: 5,
  // We enable this experimental feature to prevent Chromium from chrashing when we run all specs at once.
  experimentalMemoryManagement: true,

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
    // We enable this experimental feature to allow us to run all specs at once.
    experimentalRunAllSpecs: true,
  },

  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
  },
});
