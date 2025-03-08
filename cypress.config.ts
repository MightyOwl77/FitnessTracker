
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: false,
    experimentalStudio: false,
    chromeWebSecurity: false
  },
  video: false,
  screenshotsFolder: false,
  // Force headless mode
  defaultCommandTimeout: 10000,
  requestTimeout: 10000
})
