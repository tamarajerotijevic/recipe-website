import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, test, expect, beforeEach } from "vitest";

// --- MOCK API ---
const mockGetProducts = vi.fn();
vi.mock("../../src/api/products", () => ({
  getProducts: (...args) => mockGetProducts(...args),
}));

const mockAddToCart = vi.fn();
const mockGetCart = vi.fn();
vi.mock("../../src/api/cart", () => ({
  addToCart: (...args) => mockAddToCart(...args),
  getCart: (...args) => mockGetCart(...args),
}));

import Products from "../../src/pages/Products";

beforeEach(() => {
  mockGetProducts.mockReset();
  mockAddToCart.mockReset();
  mockGetCart.mockReset();

  vi.spyOn(window, "alert").mockImplementation(() => {});
});

function renderProducts(props = {}) {
  return render(
    <Products
      role="guest"
      cartItems={[]}
      setCartItems={vi.fn()}
      {...props}
    />
  );
}

describe("Products stranica", () => {
  test("prikazuje loading pa katalog proizvoda i broj pronađenih", async () => {
    mockGetProducts.mockResolvedValueOnce([
      {
        id: 1,
        name: "Mleko",
        price: 100,
        packageAmount: "1L",
        ingredientType: "Mlečni",
        image: "🧺",
      },
      {
        id: 2,
        name: "Hleb",
        price: 80,
        packageAmount: "500g",
        ingredientType: "Pekarski",
        image: "🧺",
      },
    ]);

    renderProducts();

    // loading
    expect(screen.getByText("Učitavanje proizvoda...")).toBeInTheDocument();

    // posle učitavanja
    expect(await screen.findByText("Katalog proizvoda")).toBeInTheDocument();

    // prikaz proizvoda
    expect(screen.getByText("Mleko")).toBeInTheDocument();
    expect(screen.getByText("Hleb")).toBeInTheDocument();

    // broj pronađenih
    expect(screen.getByText(/Pronađeno 2 proizvod/i)).toBeInTheDocument();
  });

  test("pretraga filtrira proizvode po nazivu ili tipu", async () => {
    mockGetProducts.mockResolvedValueOnce([
      { id: 1, name: "Mleko", price: 100, packageAmount: "1L", ingredientType: "Mlečni", image: "🧺" },
      { id: 2, name: "Hleb", price: 80, packageAmount: "500g", ingredientType: "Pekarski", image: "🧺" },
    ]);

    const user = userEvent.setup();
    renderProducts();

    await screen.findByText("Katalog proizvoda");

    // input ima placeholder "Unesite naziv ili tip..."
    const searchInput = screen.getByPlaceholderText("Unesite naziv ili tip...");

    await user.type(searchInput, "mle");

    // ostaje samo Mleko
    expect(screen.getByText("Mleko")).toBeInTheDocument();
    expect(screen.queryByText("Hleb")).toBeNull();

    expect(screen.getByText(/Pronađeno 1 proizvod/i)).toBeInTheDocument();
  });

  test("filter po tipu (select) filtrira proizvode", async () => {
    mockGetProducts.mockResolvedValueOnce([
      { id: 1, name: "Mleko", price: 100, packageAmount: "1L", ingredientType: "Mlečni", image: "🧺" },
      { id: 2, name: "Jogurt", price: 120, packageAmount: "500g", ingredientType: "Mlečni", image: "🧺" },
      { id: 3, name: "Hleb", price: 80, packageAmount: "500g", ingredientType: "Pekarski", image: "🧺" },
    ]);

    const user = userEvent.setup();
    renderProducts();

    await screen.findByText("Katalog proizvoda");

    // select ima id="ingredient-filter"
    const select = screen.getByLabelText("Filtriraj po tipu:");

    await user.selectOptions(select, "Pekarski");

    expect(screen.getByText("Hleb")).toBeInTheDocument();
    expect(screen.queryByText("Mleko")).toBeNull();
    expect(screen.queryByText("Jogurt")).toBeNull();

    expect(screen.getByText(/Pronađeno 1 proizvod/i)).toBeInTheDocument();
  });

  test("role=user prikazuje dugme 'Dodaj u Korpu' i klik poziva API + setCartItems", async () => {
    mockGetProducts.mockResolvedValueOnce([
      { id: 10, name: "Mleko", price: 100, packageAmount: "1L", ingredientType: "Mlečni", image: "🧺" },
    ]);

    mockAddToCart.mockResolvedValueOnce({ ok: true });

    // simuliramo odgovor korpe sa servera (tvoj Products.jsx normalizuje ovo)
    mockGetCart.mockResolvedValueOnce([
      {
        productId: 10,
        quantity: 1,
        product: { name: "Mleko", price: 100, imageUrl: "" },
      },
    ]);

    const user = userEvent.setup();
    const setCartItems = vi.fn();

    renderProducts({ role: "user", setCartItems });

    await screen.findByText("Katalog proizvoda");

    // za user postoji dugme
    const addBtn = screen.getByRole("button", { name: "Dodaj u Korpu" });
    await user.click(addBtn);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(10, 1);
      expect(mockGetCart).toHaveBeenCalledTimes(1);
      expect(setCartItems).toHaveBeenCalledTimes(1);
    });

    // alert da je dodat
    expect(window.alert).toHaveBeenCalled();
  });

  test("role=guest nema dugme 'Dodaj u Korpu'", async () => {
    mockGetProducts.mockResolvedValueOnce([
      { id: 1, name: "Hleb", price: 80, packageAmount: "500g", ingredientType: "Pekarski", image: "🧺" },
    ]);

    renderProducts({ role: "guest" });

    await screen.findByText("Katalog proizvoda");

    expect(screen.queryByRole("button", { name: "Dodaj u Korpu" })).toBeNull();
  });

  test("ako API pukne prikazuje error poruku", async () => {
    mockGetProducts.mockRejectedValueOnce(new Error("Network error"));

    renderProducts();

    // posle load-a
    expect(await screen.findByText(/Network error|Greška pri učitavanju proizvoda/i)).toBeInTheDocument();
  });
});