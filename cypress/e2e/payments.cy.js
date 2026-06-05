describe("Platnosci", () => {
  beforeEach(() => {
    cy.visitApp();
  });

  it("20. wysyla formularz platnosci do backendu i pokazuje potwierdzenie", () => {
    cy.intercept("POST", "**/api/payments").as("processPayment");
    cy.addProductToCart("Mysz bezprzewodowa");
    cy.openCart();

    cy.contains("h2", "Platnosci").should("be.visible");
    cy.contains("p", "Do zaplaty: 149.00 PLN").should("be.visible");
    cy.get('input[name="fullName"]').should("have.attr", "required");
    cy.get('input[name="email"]').should("have.attr", "type", "email");
    cy.get('input[name="address"]').should("have.attr", "required");

    cy.get('input[name="fullName"]').type("Jan Kowalski");
    cy.get('input[name="email"]').type("jan.kowalski@example.com");
    cy.get('input[name="address"]').type("ul. Testowa 1, Warszawa");

    cy.contains("button", "Zaplac").should("be.enabled").click();
    cy.wait("@processPayment").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.request.body.fullName).to.eq("Jan Kowalski");
      expect(interception.request.body.email).to.eq("jan.kowalski@example.com");
      expect(interception.request.body.amount).to.eq(149);
    });
    cy.contains("Platnosc przyjeta od Jan Kowalski na kwote 149 PLN").should("be.visible");
    cy.contains("jan.kowalski@example.com").should("be.visible");
  });

  it("28. pokazuje laczna kwote platnosci dla wielu produktow w koszyku", () => {
    cy.addProductToCart("Mysz bezprzewodowa");
    cy.addProductToCart("Kamera internetowa");
    cy.openCart();

    cy.contains("p.total", "408.00 PLN").should("be.visible");
    cy.contains("p", "Do zaplaty: 408.00 PLN").should("be.visible");
    cy.get('input[name="fullName"]').should("have.value", "");
    cy.get('input[placeholder="Imie i nazwisko"]').should("be.visible");
  });
});
