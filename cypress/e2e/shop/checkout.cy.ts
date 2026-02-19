describe("Shop - Checkout WhatsApp", () => {
  let testProduct: Record<string, unknown>;

  before(() => {
    cy.createTestProduct({
      name: "VESTIDO CHECKOUT E2E",
      price: 279.8,
      sizes: ["P", "M"],
      colors: [{ name: "OFF", hex: "#FFFFF0" }],
    }).then((product) => {
      testProduct = product;
    });
  });

  after(() => {
    if (testProduct?._id) {
      cy.deleteTestProduct(testProduct._id as string);
    }
  });

  function addProductToCart() {
    cy.visit(`/shop/catalog/product/${testProduct.slug}`);
    cy.contains("Tamanho")
      .parent()
      .within(() => {
        cy.contains("button", "M").click();
      });
    cy.contains("button", "Adicionar ao Carrinho").click();
    cy.contains("Adicionado ao Carrinho!").should("be.visible");
  }

  it("deve exibir carrinho vazio na página de checkout sem itens", () => {
    cy.clearCookies();
    cy.visit("/shop/checkout");

    cy.contains("Carrinho vazio").should("be.visible");
    cy.contains("Ver Catálogo").should("be.visible");
  });

  it("deve exibir itens e formulário na página de checkout", () => {
    cy.clearCookies();
    addProductToCart();

    cy.visit("/shop/checkout");

    // Order items
    cy.contains("VESTIDO CHECKOUT E2E").should("be.visible");
    cy.contains("Tam: M").should("be.visible");

    // Customer form
    cy.contains("Seus Dados").should("be.visible");
    cy.get('input[placeholder="Seu nome completo"]').should("be.visible");
    cy.get('input[placeholder="(71) 99999-9999"]').should("be.visible");

    // Summary
    cy.contains("Resumo").should("be.visible");
    cy.contains("R$ 279,80").should("be.visible");

    // WhatsApp button
    cy.contains("Enviar Pedido via WhatsApp").should("be.visible");
  });

  it("deve exibir o link voltar ao carrinho", () => {
    cy.clearCookies();
    addProductToCart();

    cy.visit("/shop/checkout");
    cy.contains("Voltar ao carrinho").click();

    cy.url().should("include", "/shop/carrinho");
  });

  it("deve enviar pedido via WhatsApp com sucesso", () => {
    cy.clearCookies();
    addProductToCart();

    cy.visit("/shop/checkout");

    // Stub window.open to prevent WhatsApp from actually opening
    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpen");
    });

    // Fill customer form
    cy.get('input[placeholder="Seu nome completo"]').type("Maria Silva Teste");
    cy.get('input[placeholder="(71) 99999-9999"]').type("(71) 99142-6930");
    cy.get('input[placeholder="seu@email.com"]').type("maria@teste.com");
    cy.get("textarea").type("Pedido de teste E2E - por favor ignorar");

    // Submit
    cy.contains("Enviar Pedido via WhatsApp").click();

    // Wait for success screen
    cy.contains("Pedido Realizado com Sucesso!", { timeout: 15000 }).should(
      "be.visible"
    );

    // Verify order number is shown
    cy.contains("#VB-").should("be.visible");

    // Verify window.open was called with WhatsApp URL
    cy.get("@windowOpen").should("have.been.calledOnce");
    cy.get("@windowOpen").then((stub) => {
      const call = (stub as unknown as Cypress.Agent<sinon.SinonStub>).getCall(0);
      const url = call.args[0] as string;
      expect(url).to.include("https://wa.me/5571991426930");
      expect(url).to.include("Maria+Silva+Teste");
      expect(url).to.include("VESTIDO+CHECKOUT+E2E");
    });
  });

  it("deve esvaziar o carrinho após checkout", () => {
    cy.clearCookies();
    addProductToCart();

    cy.visit("/shop/checkout");

    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpen");
    });

    cy.get('input[placeholder="Seu nome completo"]').type("João Teste");
    cy.get('input[placeholder="(71) 99999-9999"]').type("(71) 98888-7777");
    cy.contains("Enviar Pedido via WhatsApp").click();

    cy.contains("Pedido Realizado com Sucesso!", { timeout: 15000 }).should(
      "be.visible"
    );

    // Go back to shop and check cart is empty
    cy.contains("Voltar à Loja").click();

    // Cart badge should not show a number (0 items)
    cy.get("header")
      .find("a[href='/shop/carrinho']")
      .find("span")
      .should("not.exist");
  });
});
