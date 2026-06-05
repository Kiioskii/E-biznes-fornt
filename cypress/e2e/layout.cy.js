describe("Layout i nawigacja", () => {
  beforeEach(() => {
    cy.visitApp();
  });

  it("1. wyswietla tytul i podtytul strony glownej", () => {
    cy.get("main.container").should("be.visible");
    cy.contains("h1", "Sklep internetowy").should("be.visible").and("contain.text", "Sklep");
    cy.contains("p.subtitle", "React Hooks + Kotlin backend").should("be.visible");
    cy.get("nav.nav").should("exist").and("be.visible");
  });

  it("2. przekierowuje nieznana sciezke na liste produktow", () => {
    cy.visit("/nieistniejaca-strona");
    cy.url().should("include", "/products");
    cy.url().should("not.include", "nieistniejaca");
    cy.contains("h2", "Produkty").should("be.visible");
    cy.get("ul.list li.item").should("have.length.at.least", 1);
  });

  it("3. wyswietla link nawigacyjny do listy produktow", () => {
    cy.get("nav.nav a").contains("Lista produktow").should("be.visible").and("have.attr", "href", "/products");
    cy.get("nav.nav").contains("a", "Lista produktow").click();
    cy.url().should("include", "/products");
    cy.contains("h2", "Produkty").should("be.visible");
  });

  it("4. wyswietla link koszyka z licznikiem 0 na starcie", () => {
    cy.get("nav.nav a").contains("Koszyk (0)").should("be.visible").and("have.attr", "href", "/cart");
    cy.get("nav.nav").should("contain.text", "Koszyk");
  });
});
