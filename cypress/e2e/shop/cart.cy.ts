describe("Shop - Carrinho", () => {
  let testProduct: Record<string, unknown>;

  before(() => {
    cy.createTestProduct({
      name: "BIQUÍNI CARRINHO E2E",
      price: 159.8,
      sizes: ["P", "M", "G"],
      colors: [{ name: "PRETO", hex: "#000000" }],
    }).then((product) => {
      testProduct = product;
    });
  });

  after(() => {
    if (testProduct?._id) {
      cy.deleteTestProduct(testProduct._id as string);
    }
  });

  beforeEach(() => {
    cy.clearCookies();
  });

  it("deve exigir seleção de tamanho antes de adicionar ao carrinho", () => {
    cy.visit(`/shop/catalog/product/${testProduct.slug}`);

    cy.contains("Selecione um tamanho para continuar").should("be.visible");
    cy.contains("button", "Adicionar ao Carrinho").should("be.disabled");
  });

  it("deve adicionar produto ao carrinho", () => {
    cy.visit(`/shop/catalog/product/${testProduct.slug}`);

    // Select size
    cy.contains("Tamanho")
      .parent()
      .within(() => {
        cy.contains("button", "M").click();
      });

    // Add to cart
    cy.contains("button", "Adicionar ao Carrinho").should("not.be.disabled");
    cy.contains("button", "Adicionar ao Carrinho").click();

    // Verify success feedback
    cy.contains("Adicionado ao Carrinho!").should("be.visible");

    // Verify cart badge in header
    cy.get("header").find("a[href='/shop/carrinho']").within(() => {
      cy.get("span").contains("1").should("be.visible");
    });
  });

  it("deve exibir item no carrinho com dados corretos", () => {
    cy.visit(`/shop/catalog/product/${testProduct.slug}`);

    cy.contains("Tamanho")
      .parent()
      .within(() => {
        cy.contains("button", "P").click();
      });
    cy.contains("button", "Adicionar ao Carrinho").click();
    cy.contains("Adicionado ao Carrinho!").should("be.visible");

    // Navigate to cart
    cy.visit("/shop/carrinho");

    cy.contains("BIQUÍNI CARRINHO E2E").should("be.visible");
    cy.contains("Tam: P").should("be.visible");
    cy.contains("R$ 159,80").should("be.visible");
    cy.contains("Resumo do Pedido").should("be.visible");
  });

  it("deve aumentar e diminuir a quantidade", () => {
    cy.visit(`/shop/catalog/product/${testProduct.slug}`);

    cy.contains("Tamanho")
      .parent()
      .within(() => {
        cy.contains("button", "G").click();
      });
    cy.contains("button", "Adicionar ao Carrinho").click();

    cy.visit("/shop/carrinho");

    // Current quantity should be 1
    cy.get("[data-testid='item-quantity']").should("contain", "1");

    // Increase quantity
    cy.get("[data-testid='btn-increase']").first().click();
    cy.wait(500);
    cy.get("[data-testid='item-quantity']").should("contain", "2");

    // Decrease quantity
    cy.get("[data-testid='btn-decrease']").first().click();
    cy.wait(500);
    cy.get("[data-testid='item-quantity']").should("contain", "1");
  });

  it("deve remover item do carrinho", () => {
    cy.visit(`/shop/catalog/product/${testProduct.slug}`);

    cy.contains("Tamanho")
      .parent()
      .within(() => {
        cy.contains("button", "M").click();
      });
    cy.contains("button", "Adicionar ao Carrinho").click();

    cy.visit("/shop/carrinho");
    cy.contains("BIQUÍNI CARRINHO E2E").should("be.visible");

    // Click trash icon
    cy.get("[data-testid='btn-remove']").first().click();
    cy.wait(500);

    // Cart should be empty
    cy.contains("Seu carrinho está vazio").should("be.visible");
  });

  it("deve navegar para o catálogo ao clicar em Continuar Comprando", () => {
    cy.visit(`/shop/catalog/product/${testProduct.slug}`);

    cy.contains("Tamanho")
      .parent()
      .within(() => {
        cy.contains("button", "M").click();
      });
    cy.contains("button", "Adicionar ao Carrinho").click();

    cy.visit("/shop/carrinho");
    cy.contains("Continuar Comprando").click();

    cy.url().should("include", "/shop/catalog");
  });

  it("deve exibir o botão Finalizar Pedido", () => {
    cy.visit(`/shop/catalog/product/${testProduct.slug}`);

    cy.contains("Tamanho")
      .parent()
      .within(() => {
        cy.contains("button", "M").click();
      });
    cy.contains("button", "Adicionar ao Carrinho").click();

    cy.visit("/shop/carrinho");
    cy.contains("Finalizar Pedido").should("be.visible");
    cy.contains("Finalizar Pedido").click();

    cy.url().should("include", "/shop/checkout");
  });
});
