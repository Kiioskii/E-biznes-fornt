describe("Backend API", () => {
  const apiUrl = Cypress.env("apiUrl");

  after(() => {
    cy.cleanupTestProducts();
  });

  describe("GET /api/products", () => {
    it("21. zwraca pelna liste produktow z poprawna struktura", () => {
      cy.request("GET", `${apiUrl}/products`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers["content-type"]).to.include("application/json");
        expect(response.body).to.be.an("array");
        expect(response.body).to.have.length(8);

        response.body.forEach((product) => {
          expect(product).to.have.all.keys("id", "name", "description", "price");
          expect(product.id).to.be.a("number");
          expect(product.name).to.be.a("string").and.not.be.empty;
          expect(product.description).to.be.a("string").and.not.be.empty;
          expect(Number(product.price)).to.be.greaterThan(0);
        });

        const ids = response.body.map((product) => product.id);
        expect(ids).to.deep.equal([...ids].sort((a, b) => a - b));
      });
    });

    it("31. negatywny: nieobslugiwana metoda HTTP zwraca 405", () => {
      cy.request({
        method: "DELETE",
        url: `${apiUrl}/products`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(405);
      });
    });
  });

  describe("GET /api/products/{id}", () => {
    it("22. zwraca szczegoly pojedynczego produktu", () => {
      cy.request("GET", `${apiUrl}/products/1`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.id).to.eq(1);
        expect(response.body.name).to.eq("Laptop");
        expect(response.body.description).to.include("14 cali");
        expect(Number(response.body.price)).to.eq(3999.99);
      });
    });

    it("23. negatywny: nieistniejacy produkt zwraca 404", () => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/products/99999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe("POST /api/products", () => {
    it("26a. tworzy nowy produkt", () => {
      cy.request("POST", `${apiUrl}/products`, {
        name: "Produkt testowy Cypress",
        description: "Opis produktu utworzonego w teście E2E.",
        price: 99.99
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.name).to.eq("Produkt testowy Cypress");
        expect(response.body.description).to.include("E2E");
        expect(Number(response.body.price)).to.eq(99.99);
        expect(response.body.id).to.be.a("number");

        cy.request("DELETE", `${apiUrl}/products/${response.body.id}`);
      });
    });

    it("32. negatywny: puste body zwraca 400", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/products`,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });

  describe("PUT /api/products/{id}", () => {
    it("26b. aktualizuje istniejacy produkt", () => {
      cy.request("POST", `${apiUrl}/products`, {
        name: "Produkt do aktualizacji",
        description: "Tymczasowy produkt testowy.",
        price: 50
      }).then((createResponse) => {
        const createdId = createResponse.body.id;

        cy.request("PUT", `${apiUrl}/products/${createdId}`, {
          name: "Produkt testowy - zaktualizowany",
          description: "Zaktualizowany opis produktu testowego.",
          price: 129.5
        }).then((updateResponse) => {
          expect(updateResponse.status).to.eq(200);
          expect(updateResponse.body.name).to.eq("Produkt testowy - zaktualizowany");
          expect(Number(updateResponse.body.price)).to.eq(129.5);
        });

        cy.request("DELETE", `${apiUrl}/products/${createdId}`);
      });
    });

    it("33. negatywny: aktualizacja nieistniejacego produktu zwraca 404", () => {
      cy.request({
        method: "PUT",
        url: `${apiUrl}/products/99999`,
        body: {
          name: "Nieistniejacy",
          description: "Brak produktu.",
          price: 1
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe("DELETE /api/products/{id}", () => {
    it("26c. usuwa istniejacy produkt", () => {
      cy.request("POST", `${apiUrl}/products`, {
        name: "Produkt do usuniecia",
        description: "Tymczasowy produkt testowy.",
        price: 25
      }).then((createResponse) => {
        const createdId = createResponse.body.id;

        cy.request("DELETE", `${apiUrl}/products/${createdId}`).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(204);
        });

        cy.request({
          method: "GET",
          url: `${apiUrl}/products/${createdId}`,
          failOnStatusCode: false
        }).then((missingResponse) => {
          expect(missingResponse.status).to.eq(404);
        });
      });
    });

    it("34. negatywny: usuniecie nieistniejacego produktu zwraca 404", () => {
      cy.request({
        method: "DELETE",
        url: `${apiUrl}/products/99999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe("POST /api/cart", () => {
    it("24. zapisuje koszyk i zwraca podsumowanie liczby sztuk", () => {
      cy.request("POST", `${apiUrl}/cart`, {
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 }
        ]
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.eq("Koszyk zapisany. Liczba sztuk: 3");
      });
    });

    it("35. negatywny: brak pola items zwraca 400", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/cart`,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });

  describe("POST /api/payments", () => {
    it("25. przetwarza platnosc i zwraca potwierdzenie", () => {
      cy.request("POST", `${apiUrl}/payments`, {
        fullName: "Anna Nowak",
        email: "anna.nowak@example.com",
        address: "ul. Kwiatowa 5, Krakow",
        amount: 549.99
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.include("Platnosc przyjeta od Anna Nowak");
        expect(response.body.message).to.include("549.99 PLN");
        expect(response.body.message).to.include("anna.nowak@example.com");
      });
    });

    it("36. negatywny: brak wymaganych pol zwraca 400", () => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/payments`,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });
});
