const API_URL = Cypress.env("apiUrl") || "http://localhost:8080/api";

Cypress.Commands.add("apiUrl", () => API_URL);

Cypress.Commands.add("cleanupTestProducts", () => {
  cy.request("GET", `${API_URL}/products`).then((response) => {
    const testProductIds = response.body.filter((product) => product.id > 8).map((product) => product.id);
    testProductIds.forEach((id) => {
      cy.request("DELETE", `${API_URL}/products/${id}`);
    });
  });
});

Cypress.Commands.add("getProductCount", () => {
  return cy.request("GET", `${API_URL}/products`).its("body.length");
});

Cypress.Commands.add("mockProductsApi", (options = {}) => {
  const { products, statusCode = 200, delay = 0 } = options;

  cy.fixture("products").then((defaultProducts) => {
    cy.intercept("GET", "**/api/products", (req) => {
      req.reply({
        statusCode,
        delay,
        body: products ?? defaultProducts
      });
    }).as("getProducts");
  });
});

Cypress.Commands.add("mockCartApi", (message = "Koszyk zapisany. Liczba sztuk: 2") => {
  cy.intercept("POST", "**/api/cart", {
    statusCode: 200,
    body: { message }
  }).as("saveCart");
});

Cypress.Commands.add("mockPaymentsApi", (message) => {
  cy.intercept("POST", "**/api/payments", (req) => {
    req.reply({
      statusCode: 200,
      body: {
        message:
          message ??
          `Platnosc przyjeta od ${req.body.fullName} na kwote ${req.body.amount} PLN. Potwierdzenie wyslane na ${req.body.email}.`
      }
    });
  }).as("processPayment");
});

Cypress.Commands.add("visitApp", (path = "/products", options = {}) => {
  const { useMock = false, mockOptions = {} } = options;

  if (useMock) {
    cy.mockProductsApi(mockOptions);
  } else {
    cy.intercept("GET", "**/api/products").as("getProducts");
  }

  cy.visit(path);
  cy.wait("@getProducts");
});

Cypress.Commands.add("addProductToCart", (productName) => {
  cy.contains("li.item", productName).find("button.btn-primary").click();
});

Cypress.Commands.add("openCart", () => {
  cy.get("nav.nav").contains("a", "Koszyk").click();
  cy.url().should("include", "/cart");
});
