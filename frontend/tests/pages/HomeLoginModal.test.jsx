import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../../src/context/AuthContext";
import Home from "../../src/pages/Home";

function renderHome() {
  return render(
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}

describe("Home - otvaranje login modala", () => {
  beforeEach(() => {
    
    localStorage.removeItem("token");
  });

  test('klik na "Uloguj se kao Korisnik" otvara modal "Prijava"', async () => {
    const user = userEvent.setup();
    renderHome();

    
    expect(
      await screen.findByText(/Kako želite da koristite našu aplikaciju\?/i)
    ).toBeInTheDocument();

    //Dugme za korisnika
    await user.click(
      screen.getByRole("button", { name: /Uloguj se kao Korisnik/i })
    );

   
    expect(screen.getByRole("heading", { name: /Prijava/i })).toBeInTheDocument();

    // Polja
    expect(screen.getByText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Lozinka/i)).toBeInTheDocument();

    // Dugme za submit
    expect(
      screen.getByRole("button", { name: /Prijavi se/i })
    ).toBeInTheDocument();
  });

  test('klik na "Uloguj se kao Admin" otvara modal "Admin prijava"', async () => {
    const user = userEvent.setup();
    renderHome();

    expect(
      await screen.findByText(/Kako želite da koristite našu aplikaciju\?/i)
    ).toBeInTheDocument();

    // Klik na dugme za admina
    await user.click(
      screen.getByRole("button", { name: /Uloguj se kao Admin/i })
    );

    // Modal za admina
    expect(
      screen.getByRole("heading", { name: /Admin prijava/i })
    ).toBeInTheDocument();

    
    expect(
      screen.getByRole("button", { name: /Prijavi se/i })
    ).toBeInTheDocument();
  });
});