describe("Admin - Login", () => {
  beforeEach(() => {
    cy.visit("/admin");
  });

  it("deve exibir o formulário de login", () => {
    cy.contains("VB Swimwear").should("be.visible");
    cy.contains("Painel Administrativo").should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.contains("button", "Entrar").should("be.visible");
  });

  it("deve mostrar erro com senha incorreta", () => {
    cy.get('input[type="password"]').type("senhaerrada123");
    cy.contains("button", "Entrar").click();
    cy.contains("Senha incorreta").should("be.visible");
  });

  it("deve fazer login com senha correta", () => {
    const password = Cypress.env("ADMIN_PASSWORD");
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "Entrar").click();

    cy.contains("Dashboard").should("be.visible");
    cy.contains("Visão geral da sua loja VB Swimwear").should("be.visible");
  });

  it("deve exibir links de navegação no sidebar após login", () => {
    const password = Cypress.env("ADMIN_PASSWORD");
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "Entrar").click();

    cy.contains("Dashboard").should("be.visible");
    cy.contains("Produtos").should("be.visible");
    cy.contains("Novo Produto").should("be.visible");
  });

  it("deve fazer logout ao clicar em Sair", () => {
    const password = Cypress.env("ADMIN_PASSWORD");
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "Entrar").click();

    cy.contains("Dashboard").should("be.visible");
    cy.contains("Sair").click();

    cy.get('input[type="password"]').should("be.visible");
    cy.contains("Painel Administrativo").should("be.visible");
  });

  it("deve alternar visibilidade da senha", () => {
    const password = Cypress.env("ADMIN_PASSWORD");
    cy.get('input[type="password"]').type(password);

    // Initially password is hidden
    cy.get("input").first().should("have.attr", "type", "password");

    // Click eye icon to show password
    cy.get('input[type="password"]')
      .parent()
      .find("button")
      .click();

    cy.get("input").first().should("have.attr", "type", "text");

    // Click again to hide
    cy.get('input[type="text"]')
      .parent()
      .find("button")
      .click();

    cy.get("input").first().should("have.attr", "type", "password");
  });
});
