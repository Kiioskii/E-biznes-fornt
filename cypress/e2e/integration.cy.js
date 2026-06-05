describe("Integracja frontend-backend", () => {
  it("29. wyswietla produkty pobrane bezposrednio z backendu", () => {
    cy.getProductCount().then((count) => {
      expect(count).to.be.at.least(8);
      cy.wrap(count).as("productCount");
    });

    cy.visitApp();
    cy.get("@productCount").then((count) => {
      cy.get("ul.list li.item").should("have.length", count);
    });
    cy.contains("strong", "Stacja dokujaca USB-C").should("be.visible");
    cy.contains("small", "349.9 PLN").should("be.visible");
  });

  it("30. realizuje pelny przeplyw zakupowy od listy do platnosci", () => {
    cy.intercept("POST", "**/api/cart").as("saveCart");
    cy.intercept("POST", "**/api/payments").as("processPayment");

    cy.visitApp();
    cy.addProductToCart("Monitor 27");
    cy.addProductToCart("Monitor 27");
    cy.get("nav.nav").contains("a", "Koszyk (2)").should("be.visible");

    cy.openCart();
    cy.contains("p.total", "2798.00 PLN").should("be.visible");
    cy.contains("button", "Wyslij koszyk").click();
    cy.wait("@saveCart").its("response.body.message").should("eq", "Koszyk zapisany. Liczba sztuk: 2");

    cy.get('input[name="fullName"]').type("Piotr Zielinski");
    cy.get('input[name="email"]').type("piotr.zielinski@example.com");
    cy.get('input[name="address"]').type("ul. Lipowa 12, Gdansk");
    cy.contains("button", "Zaplac").click();

    cy.wait("@processPayment").then((interception) => {
      expect(interception.request.body.amount).to.eq(2798);
      expect(interception.response.body.message).to.include("Piotr Zielinski");
      expect(interception.response.body.message).to.include("2798 PLN");
    });
    cy.contains("Platnosc przyjeta od Piotr Zielinski").should("be.visible");
  });
});
