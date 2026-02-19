describe("Shop - Navegação", () => {
  let testProduct: Record<string, unknown>;

  before(() => {
    cy.createTestProduct({
      name: "VESTIDO NAVEGAÇÃO E2E",
      featured: true,
      category: "Beachwear",
      subcategory: "Saída de Praia",
    }).then((product) => {
      testProduct = product;
    });
  });

  after(() => {
    if (testProduct?._id) {
      cy.deleteTestProduct(testProduct._id as string);
    }
  });

  it("deve exibir a página inicial com hero e seções", () => {
    cy.visit("/shop");

    cy.contains("Moda Praia com").should("be.visible");
    cy.contains("Elegância").should("be.visible");
    cy.contains("Ver Catálogo").should("be.visible");
    cy.contains("Explore Nossas Categorias").should("be.visible");
    cy.contains("Beachwear").should("be.visible");
    cy.contains("Outwear").should("be.visible");
    cy.contains("Produtos em Destaque").should("be.visible");
  });

  it("deve exibir o header com navegação", () => {
    cy.visit("/shop");

    cy.contains("VB").should("be.visible");
    cy.contains("Swimwear").should("be.visible");
    cy.contains("Início").should("be.visible");
    cy.contains("Catálogo").should("be.visible");
  });

  it("deve exibir o footer", () => {
    cy.visit("/shop");

    cy.get("footer").scrollIntoView();
    cy.get("footer").within(() => {
      cy.contains("Categorias").should("be.visible");
      cy.contains("Contato").should("be.visible");
      cy.contains("Todos os direitos reservados").should("be.visible");
    });
  });

  it("deve navegar para o catálogo", () => {
    cy.visit("/shop");
    cy.contains("Ver Catálogo").click();

    cy.url().should("include", "/shop/catalog");
    cy.contains("Catálogo").should("be.visible");
  });

  it("deve exibir produtos no catálogo e filtrar por categoria", () => {
    cy.visit("/shop/catalog");

    cy.contains("VESTIDO NAVEGAÇÃO E2E").should("be.visible");

    // Filter by category
    cy.contains("button", "Beachwear").click();
    cy.contains("VESTIDO NAVEGAÇÃO E2E").should("be.visible");

    cy.contains("button", "Outwear").click();
    cy.contains("VESTIDO NAVEGAÇÃO E2E").should("not.exist");

    cy.contains("button", "Todos").click();
    cy.contains("VESTIDO NAVEGAÇÃO E2E").should("be.visible");
  });

  it("deve abrir a página de detalhe do produto", () => {
    cy.visit("/shop/catalog");

    cy.contains("VESTIDO NAVEGAÇÃO E2E").click();

    cy.url().should("include", "/shop/catalog/product/");
    cy.contains("VESTIDO NAVEGAÇÃO E2E").should("be.visible");
    cy.contains("R$").should("be.visible");
    cy.contains("com Pix").should("be.visible");
    cy.contains("Tamanho").should("be.visible");
  });

  it("deve exibir breadcrumb na página de produto", () => {
    cy.visit("/shop/catalog");
    cy.contains("VESTIDO NAVEGAÇÃO E2E").click();

    cy.contains("Início").should("be.visible");
    cy.contains("Catálogo").should("be.visible");
    cy.contains("Beachwear").should("be.visible");
  });
});
