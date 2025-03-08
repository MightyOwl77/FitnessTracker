
/// <reference types="cypress" />

// Add Testing Library commands
import '@testing-library/cypress/add-commands'

Cypress.Commands.add('login', () => {
  // For test purposes, use the default user
  cy.visit('/login')
  cy.get('input[name="username"]').type('user')
  cy.get('input[name="password"]').type('password')
  cy.get('button[type="submit"]').click()
})
