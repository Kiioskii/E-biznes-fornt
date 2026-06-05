describe("Lista produktow", () => {
  it("5. pobiera i wyswietla liste produktow z backendu", () => {
    cy.getProductCount().then((count) => {
      cy.wrap(count).as("productCount");
    });
    cy.visitApp();
    cy.contains("h2", "Produkty").should("be.visible");
    cy.get("button.btn-secondary").contains("Odswiez").should("be.visible");
    cy.get("@productCount").then((count) => {
      expect(count).to.be.at.least(8);
      cy.get("ul.list li.item").should("have.length", count);
    });

    cy.contains("strong", "Laptop").should("be.visible");
    cy.contains("strong", "Mysz bezprzewodowa").should("be.visible");
    cy.contains("strong", "Monitor 27").should("be.visible");
    cy.contains("small", "3999.99 PLN").should("be.visible");
    cy.contains("small", "149 PLN").should("be.visible");

    cy.get("ul.list li.item").each(($item) => {
      cy.wrap($item).find("a.product-link strong").should("not.be.empty");
      cy.wrap($item).find("p").should("not.be.empty");
      cy.wrap($item).find("small").should("contain", "PLN");
      cy.wrap($item).find("button.btn-primary").should("contain", "Dodaj").and("be.enabled");
    });
  });

  it("6. pokazuje stan ladowania podczas pobierania produktow", () => {
    cy.mockProductsApi({ delay: 800 });
    cy.visit("/products");
    cy.contains("Ladowanie...").should("be.visible");
    cy.wait("@getProducts");
    cy.contains("Ladowanie...").should("not.exist");
    cy.get("ul.list li.item").should("have.length", 3);
  });

  it("7. pokazuje komunikat bledu gdy API produktow zawiedzie", () => {
    cy.mockProductsApi({ statusCode: 500 });
    cy.visit("/products");
    cy.wait("@getProducts");
    cy.contains("p.error", "Nie udalo sie pobrac produktow.").should("be.visible");
    cy.get("ul.list li.item").should("have.length", 0);
    cy.contains("Ladowanie...").should("not.exist");
  });

  it("8. odswieza liste produktow po kliknieciu przycisku Odswiez", () => {
    cy.getProductCount().then((count) => {
      cy.wrap(count).as("productCount");
    });
    cy.visitApp();
    cy.get("button.btn-secondary").contains("Odswiez").click();
    cy.wait("@getProducts");
    cy.get("@productCount").then((count) => {
      cy.get("ul.list li.item").should("have.length", count);
    });
    cy.contains("strong", "Dysk zewnetrzny 1TB").should("be.visible");
  });

  it("9. przechodzi do szczegolow produktu po kliknieciu nazwy", () => {
    cy.visitApp();
    cy.contains("a.product-link", "Mysz bezprzewodowa").should("have.attr", "href", "/products/2").click();
    cy.url().should("include", "/products/2");
    cy.contains("h2", "Mysz bezprzewodowa").should("be.visible");
    cy.contains("p.description", "Ergonomiczna mysz Bluetooth").should("be.visible");
  });
});
