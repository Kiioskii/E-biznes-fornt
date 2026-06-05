import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    env: {
      apiUrl: "http://localhost:8080/api"
    },
    setupNodeEvents(on, config) {
      return config;
    }
  }
});
