describe("Admin - Produtos CRUD", () => {
  const testProductName = `BIQUÍNI TESTE E2E ${Date.now()}`;

  beforeEach(() => {
    cy.adminLogin();
    cy.visit("/admin/produtos");
  });

  it("deve navegar para o formulário de novo produto", () => {
    cy.contains("Novo Produto").click();
    cy.url().should("include", "/admin/produtos/novo");
    cy.contains("Cadastre um novo produto na loja").should("be.visible");
  });

  it("deve criar um novo produto com todos os campos", () => {
    cy.visit("/admin/produtos/novo");

    // Basic info
    cy.get('input[placeholder="Ex: VESTIDO SERENA EYES | OFF"]').type(
      testProductName
    );
    cy.get("select").first().select("Beachwear");
    cy.get("select").eq(1).select("Biquínis");

    // Description (TipTap editor)
    cy.get(".tiptap").click().type("Descrição do produto de teste E2E.");

    // Price
    cy.get('input[placeholder="179.80"]').type("199.90");

    // Sizes
    cy.contains("button", "P").click();
    cy.contains("button", "M").click();
    cy.contains("button", "G").click();

    // Colors
    cy.get('input[placeholder="Ex: OFF, PRETO, FLORAL"]').type("CORAL");
    cy.get('.space-y-4 button').filter(':contains("")').should("exist");
    // Click the add color button (the + button near color input)
    cy.get('input[placeholder="Ex: OFF, PRETO, FLORAL"]')
      .parents(".flex")
      .find("button")
      .last()
      .click();
    cy.contains("CORAL").should("be.visible");

    // Composition
    cy.get('input[placeholder="Ex: 98% Algodão | 2% Poliamida"]').type(
      "90% Poliamida | 10% Elastano"
    );

    // Care instructions
    cy.get('input[placeholder="Ex: Lave à mão com sabão neutro"]').type(
      "Lave à mão com sabão neutro"
    );
    cy.get('input[placeholder="Ex: Lave à mão com sabão neutro"]')
      .parents(".flex")
      .find("button")
      .last()
      .click();
    cy.contains("♥ Lave à mão com sabão neutro").should("be.visible");

    // Tags
    cy.get('input[placeholder="Adicionar tag..."]').type("teste-e2e");
    cy.get('input[placeholder="Adicionar tag..."]')
      .parents(".flex")
      .find("button")
      .last()
      .click();
    cy.contains("teste-e2e").should("be.visible");

    // Featured + In stock (both should be checked by default)
    cy.get('input[type="checkbox"]').first().should("be.checked");

    // Submit
    cy.contains("button", "Cadastrar Produto").click();

    // Should redirect to product list
    cy.url().should("include", "/admin/produtos");
    cy.url().should("not.include", "/novo");
  });

  it("deve exibir o produto na lista", () => {
    // Create product via API for reliable test
    cy.createTestProduct({ name: "PRODUTO LISTA E2E" }).then((product) => {
      cy.visit("/admin/produtos");
      cy.contains("PRODUTO LISTA E2E").should("be.visible");
      cy.contains("Beachwear").should("be.visible");
      cy.contains("Em estoque").should("be.visible");

      // Cleanup
      cy.deleteTestProduct((product as { _id: string })._id);
    });
  });

  it("deve filtrar produtos pela busca", () => {
    cy.createTestProduct({ name: "BIQUÍNI BUSCA ÚNICO" }).then((product) => {
      cy.visit("/admin/produtos");

      cy.get('input[placeholder="Buscar produto..."]').type("BUSCA ÚNICO");
      cy.contains("BIQUÍNI BUSCA ÚNICO").should("be.visible");

      cy.get('input[placeholder="Buscar produto..."]').clear().type("XYZNOEXISTE");
      cy.contains("BIQUÍNI BUSCA ÚNICO").should("not.exist");

      // Cleanup
      cy.deleteTestProduct((product as { _id: string })._id);
    });
  });

  it("deve editar um produto existente", () => {
    cy.createTestProduct({ name: "PRODUTO EDITAR E2E" }).then((product) => {
      const productId = (product as { _id: string })._id;

      cy.visit(`/admin/produtos/editar/${productId}`);
      cy.contains("Editar Produto").should("be.visible");

      // Change name
      cy.get('input[placeholder="Ex: VESTIDO SERENA EYES | OFF"]')
        .clear()
        .type("PRODUTO EDITADO E2E");

      cy.contains("button", "Salvar Alterações").click();

      cy.url().should("include", "/admin/produtos");
      cy.url().should("not.include", "/editar");

      // Cleanup
      cy.deleteTestProduct(productId);
    });
  });

  it("deve remover um produto", () => {
    cy.createTestProduct({ name: "PRODUTO DELETAR E2E" }).then((product) => {
      cy.visit("/admin/produtos");
      cy.contains("PRODUTO DELETAR E2E").should("be.visible");

      // Click delete button on the row
      cy.contains("PRODUTO DELETAR E2E")
        .parents("tr")
        .find('button[class*="hover:text-red"]')
        .click();

      // Confirm dialog
      cy.on("window:confirm", () => true);

      // Product should disappear
      cy.contains("PRODUTO DELETAR E2E").should("not.exist");
    });
  });
});
