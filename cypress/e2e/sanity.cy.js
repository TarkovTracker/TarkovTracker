describe('General Sanity Checking', () => {
  it('Visits the home page', () => {
    cy.visit('/')

    cy.contains('Dashboard')
  })

  it('Can access the quests page', () => {

    cy.get('#default-drawer > div.v-navigation-drawer__content > div.px-2 > div:nth-child(7) > a:nth-child(2) > div.v-list-item__content > div').contains('Quests').click()

    cy.url().should('include', '/quests/')

    cy.get('#grid-view > div:nth-child(1) > div.my-1.py-1.col-md-12.col-lg-4.col > div > div > div > div.v-slide-group__wrapper > div > div.v-tab.v-tab--active').contains('All')
  })

  it('Can access the needed items page', () => {

    cy.get('#default-drawer > div.v-navigation-drawer__content > div.px-2 > div:nth-child(7) > a:nth-child(3) > div.v-list-item__content > div').contains('Needed Items').click()

    cy.url().should('include', '/gather/')

    cy.get('#tabs-view > div > div > div > div > div:nth-child(3) > div > table > thead').contains('Item')
  })

  it('Can access the hideout page', () => {

    cy.get('#default-drawer > div.v-navigation-drawer__content > div.px-2 > div:nth-child(7) > a:nth-child(4) > div.v-list-item__content > div').contains('Hideout').click()

    cy.url().should('include', '/hideout/')

    cy.get('#tabs-view > div > div > div > div > div > div.v-slide-group__wrapper > div').contains('Available')
  })

  it('Can access the skills page', () => {

    cy.get('#default-drawer > div.v-navigation-drawer__content > div.px-2 > div:nth-child(7) > a:nth-child(5) > div.v-list-item__content > div').contains('Skills').click()

    cy.url().should('include', '/skills/')

    cy.get('#tabs-view > div > div > div > div > div.v-item-group.theme--dark.v-slide-group.v-tabs-bar.primary--text.transparent > div.v-slide-group__wrapper > div').contains('All')
  })

  it('Can access the contributors page', () => {

    cy.get('#default-drawer > div.v-navigation-drawer__content > div.px-2 > div:nth-child(7) > a:nth-child(6) > div.v-list-item__content > div').contains('Contributors').click()

    cy.url().should('include', '/contributors/')

    cy.get('#grid-view > div:nth-child(3) > div > div > div.v-card__title.align-start > div.text-h4.pl-4.v-card--material__title').contains('Contributors')
  })

  it('Can access the settings page', () => {

    cy.get('#default-drawer > div.v-navigation-drawer__content > div.px-2 > div:nth-child(7) > a:nth-child(7) > div.v-list-item__content > div').contains('Settings').click()

    cy.url().should('include', '/settings/')

    cy.contains('Game Edition')
  })
})