describe("Koszyk", () => {
  beforeEach(() => {
    cy.visitApp();
  });

  it("12. dodaje produkt do koszyka z listy produktow", () => {
    cy.addProductToCart("Laptop");
    cy.get("nav.nav").contains("a", "Koszyk (1)").should("be.visible");
    cy.openCart();
    cy.contains("span", "Laptop").should("be.visible");
    cy.contains("p.total", "3999.99 PLN").should("be.visible");
  });

  it("13. zwieksza ilosc gdy ten sam produkt jest dodawany ponownie", () => {
    cy.addProductToCart("Laptop");
    cy.addProductToCart("Laptop");
    cy.get("nav.nav").contains("a", "Koszyk (2)").should("be.visible");
    cy.openCart();
    cy.contains("li.item", "Laptop").contains("span", "2").should("be.visible");
    cy.contains("strong", "7999.98 PLN").should("be.visible");
  });

  it("14. wyswietla dodane pozycje na stronie koszyka", () => {
    cy.addProductToCart("Klawiatura mechaniczna");
    cy.openCart();
    cy.contains("h2", "Koszyk").should("be.visible");
    cy.contains("span", "Klawiatura mechaniczna").should("be.visible");
    cy.contains("p.total", "329.50 PLN").should("be.visible");
    cy.get(".qty-controls button").should("have.length.at.least", 2);
  });

  it("15. zwieksza ilosc pozycji przyciskiem plus", () => {
    cy.addProductToCart("Mysz bezprzewodowa");
    cy.openCart();
    cy.contains("li.item", "Mysz bezprzewodowa").find("button.btn-secondary").contains("+").click();
    cy.contains("li.item", "Mysz bezprzewodowa").contains("span", "2").should("be.visible");
    cy.contains("p.total", "298.00 PLN").should("be.visible");
    cy.get("nav.nav").contains("a", "Koszyk (2)").should("be.visible");
  });

  it("16. zmniejsza ilosc pozycji przyciskiem minus", () => {
    cy.addProductToCart("Laptop");
    cy.addProductToCart("Laptop");
    cy.openCart();
    cy.contains("li.item", "Laptop").find("button.btn-secondary").contains("-").click();
    cy.contains("li.item", "Laptop").contains("span", "1").should("be.visible");
    cy.contains("p.total", "3999.99 PLN").should("be.visible");
  });

  it("17. usuwa pozycje z koszyka gdy ilosc spadnie do zera", () => {
    cy.addProductToCart("Laptop");
    cy.openCart();
    cy.contains("li.item", "Laptop").find("button.btn-secondary").contains("-").click();
    cy.contains("span", "Laptop").should("not.exist");
    cy.get("nav.nav").contains("a", "Koszyk (0)").should("be.visible");
    cy.contains("p.total", "0.00 PLN").should("be.visible");
  });

  it("18. pokazuje komunikat o pustym koszyku", () => {
    cy.openCart();
    cy.contains("Dodaj produkty do koszyka.").should("be.visible");
    cy.contains("button", "Wyslij koszyk").should("be.disabled");
    cy.get("ul.list li.item").should("not.exist");
  });

  it("19. wysyla koszyk do backendu i pokazuje potwierdzenie", () => {
    cy.intercept("POST", "**/api/cart").as("saveCart");
    cy.addProductToCart("Laptop");
    cy.addProductToCart("Mysz bezprzewodowa");
    cy.openCart();
    cy.contains("button", "Wyslij koszyk").should("be.enabled").click();
    cy.wait("@saveCart").its("response.statusCode").should("eq", 200);
    cy.contains("Koszyk zapisany. Liczba sztuk: 2").should("be.visible");
  });
});
