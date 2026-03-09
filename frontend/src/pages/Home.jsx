// Home stranica

import { useState } from "react";
import Button from "../components/Button";
import { login, register } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, setUser, logout, loading } = useAuth();

  const [authRole, setAuthRole] = useState(null); // "user" ili "admin"
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const currentRole = user ? user.role : "guest";

  // Dok AuthContext proverava token i /me, prikaži loading
  if (loading) {
    return <div style={{ padding: 20 }}>Učitavanje naloga...</div>;
  }

  const closeAuthModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleRoleSelect = (selectedRole) => {
    if (selectedRole === "guest") {
      logout(); // vraća na gosta i briše token
      closeAuthModals();
      return;
    }

    setAuthRole(selectedRole);
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!authRole) return;

    try {
      const u = await login({
        email: loginForm.email,
        password: loginForm.password,
      });

      // Ako je korisnik kliknuo Admin, a nalog nije admin -> zabrani
      if (authRole === "admin" && u.role !== "admin") {
        throw new Error("Ovaj nalog nema admin privilegije.");
      }

      setUser(u);
      closeAuthModals();
    } catch (err) {
      alert(err?.message || "Greška pri prijavi.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    try {
      const u = await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });

      setUser(u);
      closeAuthModals();
    } catch (err) {
      alert(err?.message || "Greška pri registraciji.");
    }
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <div className="hero">
          <h2>
            Dobrodošli na RecipeStore!
            <img src="/logo.png" alt="RecipeStore" className="hero-logo" />
          </h2>
          <p>Vaš put do izvrsnih recepata i kvalitetnih sastojaka</p>
        </div>

        <div className="role-selection">
          <h3>Kako želite da koristite našu aplikaciju?</h3>
          <p className="description">
            Izaberite jednu od sledećih opcija da biste nastavili
          </p>

          <div className="role-cards">
            {/* Guest Role */}
            <div className="role-card">
              <div className="role-icon">👤</div>
              <h4>Gost</h4>
              <p>Pretražujte recepte i istražite naš katalog</p>
              <ul className="role-features">
                <li>✓ Pregledajte recepte</li>
                <li>✓ Pretražujte recepte</li>
                <li>✓ Pogledajte detalje recepata</li>
              </ul>
              <Button
                label={currentRole === "guest" ? "Trenutno ste Gost" : "Nastavi kao Gost"}
                onClick={() => handleRoleSelect("guest")}
                variant={currentRole === "guest" ? "disabled" : "primary"}
                disabled={currentRole === "guest"}
              />
            </div>

            {/* Registered User Role */}
            <div className="role-card">
              <div className="role-icon">👨‍💼</div>
              <h4>Registrovani korisnik</h4>
              <p>Upravljajte svojim sastojcima i uređujte korpu za kupovinu</p>
              <ul className="role-features">
                <li>✓ Sve funkcionalnosti gost korisnika</li>
                <li>✓ Dodajte sastojke koje posedujete</li>
                <li>✓ Dodajte proizvode u korpu i izvršite kupovinu</li>
                <li>✓ Sačuvajte omiljene recepte</li>
              </ul>
              <Button
                label={currentRole === "user" ? "Ulogovan kao Korisnik" : "Uloguj se kao Korisnik"}
                onClick={() => handleRoleSelect("user")}
                variant={currentRole === "user" ? "disabled" : "primary"}
                disabled={currentRole === "user"}
              />
            </div>

            {/* Administrator Role */}
            <div className="role-card">
              <div className="role-icon">👨‍💻</div>
              <h4>Administrator</h4>
              <p>Upravljajte receptima, proizvodima i porudžbinama</p>
              <ul className="role-features">
                <li>✓ Sve funkcionalnosti ostalih korisnika</li>
                <li>✓ Upravljanje receptima</li>
                <li>✓ Upravljanje proizvodima</li>
                <li>✓ Pregled i upravljanje porudžbinama</li>
              </ul>
              <Button
                label={currentRole === "admin" ? "Ulogovan kao Admin" : "Uloguj se kao Admin"}
                onClick={() => handleRoleSelect("admin")}
                variant={currentRole === "admin" ? "disabled" : "primary"}
                disabled={currentRole === "admin"}
              />
            </div>
          </div>
        </div>

        {/* Current Role Info */}
        {currentRole !== "guest" && (
          <div className="current-role-info">
            <p>
              Trenutno ste ulogovani kao{" "}
              <strong>{currentRole === "user" ? "Korisnik" : "Admin"}</strong>
            </p>

            <Button label="Odjavi se" variant="primary" onClick={logout} />
          </div>
        )}
      </div>

      {/* Auth Modals */}
      {showLogin && (
        <div className="auth-modal" onClick={closeAuthModals}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close" onClick={closeAuthModals}>
              ✕
            </button>
            <h3>{authRole === "admin" ? "Admin prijava" : "Prijava"}</h3>

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <label>Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="input-field"
                required
              />

              <label>Lozinka</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="input-field"
                required
              />

              <Button
                label="Prijavi se"
                variant="primary"
                style={{ width: "100%" }}
                type="submit"
              />
            </form>

            {authRole === "user" && (
              <p className="auth-switch">
                Nemate nalog?{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                  }}
                >
                  Registrujte se
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {showRegister && (
        <div className="auth-modal" onClick={closeAuthModals}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close" onClick={closeAuthModals}>
              ✕
            </button>
            <h3>Registracija</h3>

            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <label>Ime i prezime</label>
              <input
                type="text"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                className="input-field"
                required
              />

              <label>Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                className="input-field"
                required
              />

              <label>Lozinka</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                className="input-field"
                required
              />

              <Button
                label="Napravi nalog"
                variant="primary"
                style={{ width: "100%" }}
                type="submit"
              />
            </form>

            <p className="auth-switch">
              Već imate nalog?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
              >
                Prijavite se
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
