import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "../test/test-utils";
import ProductDetails from "./ProductDetails";

const produkty = [
  { id: 1, name: "Laptop", description: "Opis laptopa", price: 3999.99 }
];

describe("ProductDetails", () => {
  it("pokazuje komunikat gdy produkt nie istnieje", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    renderWithRouter(
      <ProductDetails produkty={produkty} onAdd={vi.fn()} onRefresh={onRefresh} />,
      { route: "/products/999", path: "/products/:id" }
    );

    expect(screen.getByText(/Nie znaleziono produktu/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Odswiez produkty" }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("wyswietla szczegoly produktu", () => {
    renderWithRouter(
      <ProductDetails produkty={produkty} onAdd={vi.fn()} onRefresh={vi.fn()} />,
      { route: "/products/1", path: "/products/:id" }
    );

    expect(screen.getByRole("heading", { name: "Laptop" })).toBeInTheDocument();
    expect(screen.getByText("Opis laptopa")).toBeInTheDocument();
    expect(screen.getByText(/3999.99 PLN/)).toBeInTheDocument();
  });

  it("pokazuje link powrotu do listy produktow", () => {
    renderWithRouter(
      <ProductDetails produkty={produkty} onAdd={vi.fn()} onRefresh={vi.fn()} />,
      { route: "/products/1", path: "/products/:id" }
    );

    expect(screen.getByRole("link", { name: "Powrot do listy" })).toHaveAttribute("href", "/products");
  });

  it("wywoluje onAdd po kliknieciu Dodaj do koszyka", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    renderWithRouter(
      <ProductDetails produkty={produkty} onAdd={onAdd} onRefresh={vi.fn()} />,
      { route: "/products/1", path: "/products/:id" }
    );

    await user.click(screen.getByRole("button", { name: "Dodaj do koszyka" }));
    expect(onAdd).toHaveBeenCalledWith(produkty[0]);
  });
});
