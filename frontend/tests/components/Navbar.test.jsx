import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, test, expect, beforeEach } from "vitest";


let mockUser = null;
let mockLogout = vi.fn().mockResolvedValue(undefined);

let mockPathname = "/";
let mockNavigate = vi.fn();


vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: mockPathname }),
  };
});


vi.mock("../../src/context/AuthContext", () => {
  return {
    useAuth: () => ({ user: mockUser, logout: mockLogout }),
  };
});


import Navbar from "../../src/components/Navbar";

function renderNavbar() {
  return render(<Navbar />);
}

beforeEach(() => {
  mockUser = null;
  mockLogout = vi.fn().mockResolvedValue(undefined);
  mockPathname = "/";
  mockNavigate = vi.fn();
});

describe("Navbar - guest", () => {
  test("guest vidi Početna, Recepti, Proizvodi; ne vidi user/admin linkove", () => {
    renderNavbar();

    expect(screen.getByRole("button", { name: "Početna" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recepti" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proizvodi" })).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Sastojci" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Korpa" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Admin panel" })).toBeNull();

    expect(screen.queryByRole("button", { name: "Odjava" })).toBeNull();

    // Uloga prikaz
    expect(screen.getByText(/Uloga:/i)).toBeInTheDocument();
    expect(screen.getByText("Gost")).toBeInTheDocument();
  });

  test("active class se dodeljuje kad je pathname /recipes", () => {
    mockPathname = "/recipes";
    renderNavbar();

    const btnRecipes = screen.getByRole("button", { name: "Recepti" });
    expect(btnRecipes.className).toMatch(/nav-link-active/);
  });

  test("klik na Recepti poziva navigate('/recipes')", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Recepti" }));
    expect(mockNavigate).toHaveBeenCalledWith("/recipes");
  });
});

describe("Navbar - user", () => {
  test("user vidi Sastojci i Korpa, i vidi Odjava + ime", () => {
    mockUser = { role: "user", username: "Mina" };
    renderNavbar();

    expect(screen.getByText("Korisnik")).toBeInTheDocument();
    expect(screen.getByText("Mina")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Početna" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recepti" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proizvodi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sastojci" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Korpa" })).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Admin panel" })).toBeNull();

    expect(screen.getByRole("button", { name: "Odjava" })).toBeInTheDocument();
  });

  test("klik na Odjava poziva logout pa navigate('/')", async () => {
    const user = userEvent.setup();
    mockUser = { role: "user", email: "a@b.com" };

    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Odjava" }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});

describe("Navbar - admin", () => {
  test("admin vidi Admin panel i Odjava; ne vidi Recepti/Proizvodi", () => {
    mockUser = { role: "admin", username: "Admin1" };
    renderNavbar();

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Admin1")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Početna" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Admin panel" })).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Recepti" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Proizvodi" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sastojci" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Korpa" })).toBeNull();

    expect(screen.getByRole("button", { name: "Odjava" })).toBeInTheDocument();
  });

  test("klik na Admin panel poziva navigate('/admin')", async () => {
    const user = userEvent.setup();
    mockUser = { role: "admin", username: "Admin1" };

    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Admin panel" }));
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });
});