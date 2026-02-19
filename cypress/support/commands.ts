/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Log in to admin via API and store the token in localStorage.
       */
      adminLogin(): Chainable<string>;

      /**
       * Create a test product via the API. Returns the product object.
       */
      createTestProduct(
        overrides?: Record<string, unknown>
      ): Chainable<Record<string, unknown>>;

      /**
       * Delete a product by ID via the API.
       */
      deleteTestProduct(id: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("adminLogin", () => {
  const password = Cypress.env("ADMIN_PASSWORD");

  return cy
    .request({
      method: "POST",
      url: "/api/admin/auth",
      body: { password },
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      const token = response.body.token;
      window.localStorage.setItem("admin_token", token);
      return token;
    });
});

Cypress.Commands.add("createTestProduct", (overrides = {}) => {
  const password = Cypress.env("ADMIN_PASSWORD");

  return cy
    .request({
      method: "POST",
      url: "/api/admin/auth",
      body: { password },
    })
    .then((authResponse) => {
      const token = authResponse.body.token;

      const defaultProduct = {
        name: `Produto Teste ${Date.now()}`,
        description: "<h2>Descrição do Produto Teste</h2><p>Este é um produto criado para testes automatizados.</p>",
        price: 179.8,
        pixDiscountPercent: 10,
        discountPercent: 0,
        images: [],
        category: "Beachwear",
        subcategory: "Biquínis",
        colors: [{ name: "OFF", hex: "#FFFFF0" }],
        sizes: ["P", "M", "G", "GG"],
        composition: "98% Algodão | 2% Poliamida",
        careInstructions: [
          "Lave à mão com sabão neutro",
          "Seque à sombra",
        ],
        inStock: true,
        featured: true,
        tags: ["teste", "e2e"],
        ...overrides,
      };

      return cy
        .request({
          method: "POST",
          url: "/api/products",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: defaultProduct,
        })
        .then((productResponse) => {
          expect(productResponse.status).to.eq(201);
          return productResponse.body.product;
        });
    });
});

Cypress.Commands.add("deleteTestProduct", (id: string) => {
  const password = Cypress.env("ADMIN_PASSWORD");

  return cy
    .request({
      method: "POST",
      url: "/api/admin/auth",
      body: { password },
    })
    .then((authResponse) => {
      const token = authResponse.body.token;

      return cy
        .request({
          method: "DELETE",
          url: `/api/products/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => undefined);
    });
});

export {};
