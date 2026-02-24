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
        // The ID based on label "Desconto Pix (%)" should be "desconto-pix-(%)"
        // Let's use a selector that's more robust
        cy.get('label:contains("Desconto Pix (%)")').parent().find('input').clear().type("0");

        // Verify it contains 0 before submission (UI check)
        cy.get('label:contains("Desconto Pix (%)")').parent().find('input').should('have.value', '0');

        // Submit
        // We need to fill other mandatory fields to be able to submit if any
        cy.get("select").first().select("Beachwear");
        // Click some size
        cy.contains("button", "M").click();

        cy.contains("button", "Cadastrar Produto").click();

        // After redirect, search for it and check if we can verify the discount
        // Or better, check the API request if we could, but let's check the edit page
        cy.url().should("include", "/admin/produtos");

        cy.get('input[placeholder="Buscar produto..."]').type("Produto Teste Pix 0");
        cy.contains("Produto Teste Pix 0").parents('tr').find('a[href*="/editar/"]').click();

        // Check if it's still 0
        cy.get('label:contains("Desconto Pix (%)")').parent().find('input').should('have.value', '0');
    });
});
