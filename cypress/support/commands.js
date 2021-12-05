// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add("headerAndFooterVisible", () => {
  cy.get("nav").should("be.visible");
  cy.get("footer").should("be.visible");
});

Cypress.Commands.add("login", () => {
  cy.fixture("credentials").as("credentials");
  cy.get("@credentials").then((credentials) => {
    cy.visit("/users/login");
    cy.get("input[name='email']").type(credentials.email);
    cy.get("input[name='password']").type(credentials.password);
    cy.get("button").contains("Login").click();
  });
});
