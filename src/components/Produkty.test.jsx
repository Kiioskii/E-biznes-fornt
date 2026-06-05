import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Produkty from "./Produkty";

const produkty = [
  { id: 1, name: "Laptop", description: "Opis laptopa", price: 3999.99 },
  { id: 2, name: "Mysz", description: "Opis myszy", price: 149 }
];

function renderProdukty(props = {}) {
  return render(
    <MemoryRouter>
      <Produkty
        produkty={produkty}
        loading={false}
        error=""
        onRefresh={vi.fn()}
        onAdd={vi.fn()}
        {...props}
      />
    </MemoryRouter>
  );
}

describe("Produkty", () => {
  it("wyswietla stan ladowania", () => {
    renderProdukty({ loading: true });

    expect(screen.getByText("Ladowanie...")).toBeInTheDocument();
  });

  it("wyswietla blad", () => {
    renderProdukty({ error: "Blad pobierania" });

    expect(screen.getByText("Blad pobierania")).toBeInTheDocument();
  });

  it("renderuje liste produktow", () => {
    renderProdukty();

    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("Mysz")).toBeInTheDocument();
    expect(screen.getByText("3999.99 PLN")).toBeInTheDocument();
  });

  it("wywoluje onRefresh po kliknieciu Odswiez", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    renderProdukty({ onRefresh });

    await user.click(screen.getByRole("button", { name: "Odswiez" }));

    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("wywoluje onAdd po kliknieciu Dodaj", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderProdukty({ onAdd });

    const addButtons = screen.getAllByRole("button", { name: "Dodaj" });
    await user.click(addButtons[0]);

    expect(onAdd).toHaveBeenCalledWith(produkty[0]);
  });
});
