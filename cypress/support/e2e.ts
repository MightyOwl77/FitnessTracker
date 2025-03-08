// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Configure Cypress timeouts for slower applications
Cypress.config('defaultCommandTimeout', 10000)
Cypress.config('requestTimeout', 15000)

// Log information about test runs
Cypress.on('test:before:run', (test) => {
  console.log(`Running test: ${test.title}`)
})

// Handle uncaught exceptions
Cypress.on('uncaught:exception', () => {
  // Returning false prevents Cypress from failing the test when uncaught exceptions occur
  return false
})