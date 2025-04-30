// cypress/e2e/script-and-interaction.cy.js

import { ui } from 'support/ui';

const ADOBE_LAUNCH_URLs = [
  'https://assets.adobedtm.com/fcfd3580c848/15e23aa7fce2/launch-92311d9d9637-development.min.js',
];

describe('Script loading and user interaction test', () => {
  beforeEach(() => {
    //Cypress.env('ADOBE_ANALYTICS_URL', ADOBE_LAUNCH_URLs[0]);
    cy.visitWithLogin('/');
  });

  it('checks if external script is loaded and the page is responsive to user interaction', () => {
    cy.visit('/');
    cy.intercept(ADOBE_LAUNCH_URLs[0]).as('adobeScript');

    cy.wait('@adobeScript').its('response.statusCode').should('eq', 200);

    // Wait for Adobe to initialize
    cy.window().should((win) => {
      expect(win._satellite).to.exist;
      expect(win._satellite.track).to.be.a('function');
    });

    ui.mainSearch.find().should('be.visible');

    cy.findByTestId('top-menu-help-and-support')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.userMenuButton.find().click();
    ui.userMenu
      .find()
      .should('be.visible')
      .within(() => {
        cy.findByText('Display').should('be.visible').click();
      });

    cy.url().should('endWith', '/profile/display');
    // cy.get('@_satelliteTrack').should('be.calledWith', 'page view');
  });
});
