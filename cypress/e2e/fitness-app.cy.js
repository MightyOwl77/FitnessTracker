
describe('Fitness App E2E Tests', () => {
  beforeEach(() => {
    // Visit the base URL before each test
    cy.visit('/')
  })

  it('should load the homepage successfully', () => {
    // Check if the page loads without errors
    cy.contains('h1', /fitness|profile|dashboard/i, { timeout: 10000 })
  })

  it('should have profile form elements', () => {
    // Check for profile-related form elements
    cy.get('form').should('exist')
    cy.get('input').should('exist')
  })

  it('should have navigation elements', () => {
    // Look for navigation elements
    cy.get('nav a, button, [role="button"]').should('exist')
  })

  it('should have fitness tracking elements', () => {
    // Check for fitness-specific elements using common selectors
    cy.get('[data-testid="weight-tracking"], .weight-tracking, [id*="weight"], [data-testid="progress"], .progress, [data-testid="dashboard"], .dashboard, [data-testid="profile"], .profile')
      .should('exist')
  })

  it('should display user data if available', () => {
    // Check for weight or profile data display
    cy.contains(/weight|height|bmi|profile/i).should('exist')
  })

  // Add test for weight tracking projection
  it('should show weight projection graph when data is available', () => {
    // This test might need to be conditional based on if user is logged in
    cy.contains(/projection|progress|graph/i).should('exist')
  })
})
