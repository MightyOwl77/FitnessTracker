
describe('Daily Logging', () => {
  before(() => {
    // Reset app state and login
    cy.request('POST', '/api/reset')
    cy.login()
  })

  it('should allow logging daily stats', () => {
    // Navigate to daily log
    cy.visit('/log')
    
    // Fill out log form
    const today = new Date().toISOString().split('T')[0]
    
    cy.get('input[name="date"]').clear().type(today)
    cy.get('input[name="calories"]').clear().type('2000')
    cy.get('input[name="protein"]').clear().type('150')
    cy.get('input[name="weight"]').clear().type('79.5')
    cy.get('select[name="adherence"]').select('good')
    cy.get('button[type="submit"]').click()
    
    // Verify log was saved
    cy.contains('Log saved successfully').should('be.visible')
    
    // Verify weight updated in progress
    cy.visit('/progress')
    cy.contains('79.5').should('be.visible')
  })
})
