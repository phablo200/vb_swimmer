describe("Admin - Pix Discount Bug", () => {
    beforeEach(() => {
        cy.adminLogin();
    });

    it("should allow setting Pix discount to 0%", () => {
        cy.visit("/admin/produtos/novo");

        // Set some required fields
        cy.get('input[placeholder="Ex: VESTIDO SERENA EYES | OFF"]').type("Produto Teste Pix 0");
        cy.get('input[placeholder="179.80"]').type("100");

        // Clear and set Pix discount to 0
        cy.get('label:contains("Desconto Pix (%)")').parent().find('input').clear().type("0");

        // Verify it contains 0 before submission (UI check)
        cy.get('label:contains("Desconto Pix (%)")').parent().find('input').should('have.value', '0');

        // Submit required fields
        cy.get("select").first().select("Coleção de Verão");
        cy.contains("button", "M").click();

        cy.contains("button", "Cadastrar Produto").click();

        // After redirect, search for it
        cy.url().should("include", "/admin/produtos");

        // Use a longer timeout for the list search as it might be loading
        cy.get('input[placeholder="Buscar produto..."]', { timeout: 15000 }).should('be.visible').type("Produto Teste Pix 0");

        // Click edit on the found product
        cy.contains("Produto Teste Pix 0", { timeout: 10000 }).parents('tr').find('a[href*="/editar/"]').click();

        // Verify the value in the edit form
        cy.get('label:contains("Desconto Pix (%)")').parent().find('input').should('have.value', '0');

        // Cleanup: Delete the product using the ID in the URL
        cy.url().then(url => {
            const id = url.split('/').pop();
            if (id && id.length > 20) { // basic check for mongodb ObjectID
                cy.deleteTestProduct(id);
            }
        });
    });
});
