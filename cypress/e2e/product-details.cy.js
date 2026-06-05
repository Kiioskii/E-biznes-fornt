describe("Szczegoly produktu", () => {
  it("10. wyswietla pelne informacje o wybranym produkcie", () => {
    cy.visitApp("/products/1");
    cy.contains("h2", "Laptop").should("be.visible");
    cy.contains("p.description", "Lekki laptop 14 cali").should("be.visible");
    cy.contains("strong", "Cena:").parent().should("contain", "3999.99 PLN");
    cy.contains("button", "Dodaj do koszyka").should("be.visible").and("be.enabled");
    cy.contains("a", "Powrot do listy").should("have.attr", "href", "/products").and("be.visible");
    cy.get("section.card .actions").should("exist");
  });

  it("11. pokazuje komunikat gdy produkt o danym id nie istnieje", () => {
    cy.visitApp("/products/99999");
    cy.contains("h2", "Podglad produktu").should("be.visible");
    cy.contains("Nie znaleziono produktu").should("be.visible");
    cy.contains("button", "Odswiez produkty").should("be.visible").and("be.enabled");
    cy.contains("h2", "Laptop").should("not.exist");
  });

  it("27. dodaje produkt do koszyka ze strony szczegolow", () => {
    cy.visitApp("/products/5");
    cy.contains("h2", "Sluchawki").should("be.visible");
    cy.contains("button", "Dodaj do koszyka").click();
    cy.get("nav.nav").contains("a", "Koszyk (1)").should("be.visible");
    cy.openCart();
    cy.contains("span", "Sluchawki").should("be.visible");
    cy.contains("p.total", "499.99 PLN").should("be.visible");
  });
});
