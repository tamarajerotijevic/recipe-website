const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const DEFAULT_CITY = import.meta.env.VITE_DEFAULT_CITY || "Kragujevac";

function ensureKey() {
  if (!API_KEY) {
    throw new Error("Nedostaje VITE_OPENWEATHER_API_KEY u frontend/.env");
  }
}

function normalizeWeather(data) {
  return {
    city: data.name,
    temp: Math.round(data.main?.temp ?? 0),
    feelsLike: Math.round(data.main?.feels_like ?? 0),
    humidity: data.main?.humidity ?? null,
    wind: Math.round(data.wind?.speed ?? 0),
    description: data.weather?.[0]?.description ?? "",
    icon: data.weather?.[0]?.icon ?? "01d",
    main: data.weather?.[0]?.main ?? "",
  };
}

export async function getWeatherByCity(city = DEFAULT_CITY) {
  ensureKey();

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric&lang=sr`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Greška pri učitavanju vremena.");
  }

  return normalizeWeather(data);
}

export async function getWeatherByCoords(lat, lon) {
  ensureKey();

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}&appid=${API_KEY}&units=metric&lang=sr`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Greška pri učitavanju vremena.");
  }

  return normalizeWeather(data);
}