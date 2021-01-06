/* eslint-disable no-param-reassign */
// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/');
    cy.url().should('include', '/public');
    cy.contains('a', 'Projetos').click();
    cy.get('main').should('contain', 'Detalhes técnicos');
    cy.contains('a', 'Sobre').click();
    cy.get('main').should('contain', 'Aplicação Exemplo');
    cy.contains('a', 'Estudo do OpenID').click();
    cy.get('main').should('contain', 'Servidor de autenticação');
    cy.contains('button', 'Entrar').should('exist');
  });
});
