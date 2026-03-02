import { useEffect, useState } from "react";
import { getWeatherByCity, getWeatherByCoords } from "../api/weather";

function suggestion(main, temp) {
  if (main === "Rain") return "Kiša je — idealno za brzu online kupovinu";
  if (temp <= 5) return "Hladno je — preporučujemo zimske recepte";
  if (temp >= 25) return "Toplo je — osveži se uz lagane obroke";
  if (main === "Clear") return "Lepo vreme — isplaniraj kupovinu";
  return "Pogledaj preporuke dana";
}

const descMap = {
  "ведро небо": "vedro nebo",
  "киша": "kisa",
  "облачно": "oblacno",
  "снег": "sneg"
};

export default function WeatherCard({ username }) {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [err, setErr] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);

  // when the username changes we want to forget everything we knew
  // about the previous user: weather, consent etc.  otherwise the card
  // will render the old data and skip the permission dialog because
  // `consentChecked` remains true.
  useEffect(() => {
    setConsentChecked(false);
    setWeather(null);
    setErr("");
    setLoading(true);

    let cancelled = false;
    const fallbackCity = import.meta.env.VITE_DEFAULT_CITY || "Kragujevac";
    const safeName = username || "guest"; // ensure we always have a string
    const consentKey = `weatherConsent_${safeName}`;
    const cityKey = `weatherCity_${safeName}`;

    async function load() {
      setLoading(true);
      setErr("");

      let w = null;

      // Provera da li je korisnik već dao saglasnost
      let savedConsent = localStorage.getItem(consentKey);

      if (savedConsent === null) {
        // Pitaj korisnika za lokaciju
        const allowLocation = window.confirm(
          "Želiš li da pratimo tvoju lokaciju kako bismo prikazali lokalno vreme?"
        );
        savedConsent = allowLocation ? "true" : "false";
        localStorage.setItem(consentKey, savedConsent);
      }

      setConsentChecked(true); // sada znamo da je korisnik odlučio

      try {
        if (navigator.geolocation && savedConsent === "true") {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 8000,
              maximumAge: 5 * 60 * 1000,
            });
          });

          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          w = await getWeatherByCoords(lat, lon);

          localStorage.setItem(cityKey, w.city);
        }
      } catch (e) {
        // Geolokacija nije uspela
      }

      if (!w) {
        const savedCity = localStorage.getItem(cityKey);
        try {
          w = await getWeatherByCity(savedCity || fallbackCity);
          if (!savedCity) localStorage.setItem(cityKey, w.city);
        } catch (e2) {
          if (!cancelled) setErr(e2.message || "Greška pri učitavanju vremena.");
        }
      }

      if (!cancelled) setWeather(w);
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  // NE prikazuj ništa dok korisnik nije odlučio
  if (!consentChecked) return null;

  if (loading) return <div className="weather-loading">Učitavanje vremena...</div>;
  if (err) return <div className="weather-error">Vreme: {err}</div>;
  if (!weather) return null;

  return (
    <div
      className="weather-card"
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          className="weather-icon-circle"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "2rem",
            flexShrink: 0,
          }}
        >
          {weather.main === "Sunny" && "☀️"}
           {weather.main === "Clear" && "☁️"}
          {weather.main === "Clouds" && "☁️"}
          {weather.main === "Rain" && "🌧️"}
          {weather.main === "Snow" && "❄️"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <div className="weather-city" style={{ fontWeight: "bold" }}>
            {weather.city}
          </div>
          <div className="weather-temp">{weather.temp}°C</div>
          <div className="weather-desc">{descMap[weather.description] || weather.description}</div>
          <div className="weather-suggestion">{suggestion(weather.main, weather.temp)}</div>
        </div>
      </div>

      <div className="weather-right" style={{ textAlign: "right" }}>
        <div>
          <span>Osećaj:</span> {weather.feelsLike}°C
        </div>
        <div>
          <span>Vlažnost:</span> {weather.humidity}%
        </div>
        <div>
          <span>Vetar:</span> {weather.wind} m/s
        </div>
      </div>
    </div>
  );
}