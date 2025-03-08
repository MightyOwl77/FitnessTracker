
describe('User Journey', () => {
  before(() => {
    // Reset app state before tests
    cy.request('POST', '/api/reset')
  })

  it('should navigate through the basic user flow', () => {
    // Visit the home page
    cy.visit('/')
    cy.contains('Welcome to Your Fitness Transformation').should('be.visible')
    
    // Create profile
    cy.contains('Set Up Profile').click()
    cy.url().should('include', '/profile')
    
    // Fill out profile form
    cy.get('input[name="age"]').clear().type('30')
    cy.get('select[name="gender"]').select('male')
    cy.get('input[name="height"]').clear().type('175')
    cy.get('input[name="weight"]').clear().type('80')
    cy.get('input[name="bodyFatPercentage"]').clear().type('20')
    cy.get('select[name="activityLevel"]').select('moderately')
    cy.get('button[type="submit"]').click()
    
    // Navigate to goals
    cy.contains('Set Your Goals').click()
    cy.url().should('include', '/goals')
    
    // Fill out goals form
    cy.get('input[name="currentWeight"]').clear().type('80')
    cy.get('input[name="targetWeight"]').clear().type('70')
    cy.get('input[name="timeFrame"]').clear().type('12')
    cy.get('button[type="submit"]').click()
    
    // Verify dashboard is shown with correct data
    cy.url().should('include', '/dashboard')
    cy.contains('Your Progress').should('be.visible')
    cy.contains('80').should('be.visible') // Current weight
    cy.contains('70').should('be.visible') // Target weight
  })
})
