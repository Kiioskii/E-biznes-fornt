import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Koszyk from "./Koszyk";

const items = [
  { productId: 1, name: "Laptop", price: 100, quantity: 2 },
  { productId: 2, name: "Mysz", price: 50, quantity: 1 }
];

describe("Koszyk", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("pokazuje komunikat dla pustego koszyka", () => {
    render(
      <Koszyk apiUrl="http://localhost:8080/api" items={[]} total={0} onChangeQuantity={vi.fn()} />
    );

    expect(screen.getByText("Dodaj produkty do koszyka.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wyslij koszyk" })).toBeDisabled();
  });

  it("renderuje pozycje i sume", () => {
    render(
      <Koszyk
        apiUrl="http://localhost:8080/api"
        items={items}
        total={250}
        onChangeQuantity={vi.fn()}
      />
    );

    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("Mysz")).toBeInTheDocument();
    expect(screen.getByText("200.00 PLN")).toBeInTheDocument();
    expect(screen.getByText("Suma: 250.00 PLN")).toBeInTheDocument();
  });

  it("wywoluje onChangeQuantity po zmianie ilosci", async () => {
    const user = userEvent.setup();
    const onChangeQuantity = vi.fn();

    render(
      <Koszyk
        apiUrl="http://localhost:8080/api"
        items={items}
        total={250}
        onChangeQuantity={onChangeQuantity}
      />
    );

    const plusButtons = screen.getAllByRole("button", { name: "+" });
    await user.click(plusButtons[0]);

    expect(onChangeQuantity).toHaveBeenCalledWith(1, 1);
  });

  it("wysyla koszyk do API", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      json: async () => ({ message: "Koszyk zapisany." })
    });

    render(
      <Koszyk
        apiUrl="http://localhost:8080/api"
        items={items}
        total={250}
        onChangeQuantity={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Wyslij koszyk" }));

    await waitFor(() => {
      expect(screen.getByText("Koszyk zapisany.")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 }
        ]
      })
    });
  });
});
