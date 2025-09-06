import { useState } from "react";
import "leaflet/dist/leaflet.css";

const getWeatherIcon = (description = "", isLarge = false) => {
  const size = isLarge ? "text-8xl" : "text-4xl";
  const lower = description.toLowerCase();
  if (lower.includes("rain")) return <div className={`${size} mb-2`}>🌧️</div>;
  if (lower.includes("cloud")) return <div className={`${size} mb-2`}>☁️</div>;
  if (lower.includes("storm")) return <div className={`${size} mb-2`}>⛈️</div>;
  if (lower.includes("sunny") || lower.includes("clear"))
    return <div className={`${size} mb-2`}>☀️</div>;
  return <div className={`${size} mb-2`}>🌤️</div>;
};

const getDayName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

const DarkAuroraBackground = () => {
  const stars = Array.from({ length: 120 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() < 0.8 ? 1 : 2,
    delay: `${Math.random() * 6}s`,
    duration: `${12 + Math.random() * 10}s`,
    twinkle: `${2 + Math.random() * 4}s`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#0b1020_0%,#05070d_60%,#04060b_100%)]" />
      <div className="pointer-events-none absolute -left-1/4 -top-1/3 w-[70vw] h-[70vh] aurora-glow aurora-a" />
      <div className="pointer-events-none absolute right-[-15%] top-[-10%] w-[55vw] h-[55vh] aurora-glow aurora-b" />
      <div className="pointer-events-none absolute left-[15%] bottom-[-25%] w-[60vw] h-[60vh] aurora-glow aurora-c" />
      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white opacity-80 will-change-transform"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animation: `floatY ${s.duration} ease-in-out infinite ${s.delay}, twinkle ${s.twinkle} ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
      <style>{`
        .aurora-glow { filter: blur(60px) saturate(140%); opacity: 0.28; border-radius: 9999px; }
        .aurora-a { background: radial-gradient(60% 60% at 50% 50%, rgba(56,189,248,0.9) 0%, rgba(56,189,248,0) 60%); animation: drift 26s linear infinite alternate; }
        .aurora-b { background: radial-gradient(60% 60% at 50% 50%, rgba(147,51,234,0.8) 0%, rgba(147,51,234,0) 60%); animation: drift 32s linear infinite alternate-reverse; }
        .aurora-c { background: radial-gradient(60% 60% at 50% 50%, rgba(34,197,94,0.75) 0%, rgba(34,197,94,0) 60%); animation: drift 38s linear infinite alternate; }
        @keyframes drift { 0%{transform:translate3d(0,0,0) rotate(0deg)} 50%{transform:translate3d(2vw,-1vh,0) rotate(8deg)} 100%{transform:translate3d(-2vw,2vh,0) rotate(-6deg)} }
        @keyframes floatY { 0%{transform:translateY(0px)} 50%{transform:translateY(-18px)} 100%{transform:translateY(0px)} }
        @keyframes twinkle { 0%,100%{opacity:0.85} 50%{opacity:0.35} }
      `}</style>
    </div>
  );
};

const LightSkyBackground = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100" />
);

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const getWeather = async () => {
    if (!city.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== 200) {
        alert(`Error: ${data.message}`);
        setLoading(false);
        return;
      }
      setWeather(data);
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      if (forecastData.cod !== "200") {
        setLoading(false);
        return;
      }
      const dailyForecast = forecastData.list.filter((f) =>
        f.dt_txt.includes("12:00:00")
      );
      setForecast(dailyForecast.slice(0, 5));
      let newAlerts = [];
      if (forecastData.list.some((d) => d.weather?.[0]?.description?.includes("rain")))
        newAlerts.push("Carry umbrella 🌧");
      if (forecastData.list.some((d) => d.main?.temp > 35))
        newAlerts.push("Stay hydrated 🥵");
      if (data.wind?.speed > 13.8) newAlerts.push("High winds warning 🌪");
      setAlerts(newAlerts);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") getWeather();
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen relative transition-colors duration-700">
        <div className="absolute inset-0 transition-opacity duration-700">
          {darkMode ? <DarkAuroraBackground /> : <LightSkyBackground />}
        </div>
        <div className="relative z-10 p-6 max-w-7xl mx-auto text-black dark:text-white transition-colors duration-700">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-light">Weather Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-400/50 bg-gray-200 dark:bg-gray-800 transition-all duration-500"
              >
                <div
                  className={`transform transition-transform duration-700 text-xl ${
                    darkMode ? "rotate-0" : "rotate-180"
                  }`}
                >
                  {darkMode ? "🌙" : "☀️"}
                </div>
              </button>
              <div className="relative">
                <input
                  className="bg-white/70 dark:bg-black/40 border border-gray-400/50 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-2 rounded-full w-64 text-sm focus:outline-none shadow-sm transition-colors duration-500"
                  placeholder="Search city..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="absolute right-1 top-1 bg-gray-700/30 hover:bg-gray-600/50 text-white p-1.5 rounded-full transition-all duration-300"
                  onClick={getWeather}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          {weather ? (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-gray-300 dark:border-white/10 shadow-lg transition-colors duration-500">
                  {weather?.main && (
                    <div className="flex items-center space-x-6">
                      {getWeatherIcon(weather?.weather?.[0]?.description || "", true)}
                      <div>
                        <h2 className="text-4xl font-light">
                          {Math.round(weather?.main?.temp)}°C
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 capitalize">
                          {weather?.weather?.[0]?.description}
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Location: {weather?.name}
                  </p>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {alerts.length > 0 && (
                  <div className="bg-orange-100 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-300 dark:border-orange-700/30 shadow transition-colors duration-500">
                    <h3 className="text-orange-800 dark:text-orange-300 text-sm font-medium mb-4 uppercase tracking-wide">
                      Weather Alerts
                    </h3>
                    <div className="space-y-3">
                      {alerts.map((alert, i) => (
                        <div
                          key={i}
                          className="text-orange-800 dark:text-orange-100 text-sm bg-orange-200/60 dark:bg-orange-500/10 rounded-lg p-3"
                        >
                          {alert}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {weather?.main && (
                  <div className="bg-white/70 dark:bg-white/5 rounded-2xl p-6 border border-gray-300 dark:border-white/10 shadow transition-colors duration-500">
                    <p>Humidity: {weather?.main?.humidity}%</p>
                    <p>Wind Speed: {weather?.wind?.speed} m/s</p>
                  </div>
                )}
              </div>
              <div className="col-span-12">
                <div className="bg-white/70 dark:bg-white/5 rounded-2xl p-6 border border-gray-300 dark:border-white/10 shadow transition-colors duration-500">
                  <h3 className="mb-4 text-lg">5-Day Forecast</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {forecast?.length > 0 &&
                      forecast.map((d, i) => (
                        <div
                          key={i}
                          className="bg-white/60 dark:bg-black/30 rounded-xl p-4 text-center shadow transition-colors duration-500"
                        >
                          {getWeatherIcon(d.weather?.[0]?.description)}
                          <p className="text-sm">{getDayName(d.dt_txt)}</p>
                          <p>{Math.round(d.main?.temp)}°C</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[60vh] transition-opacity duration-700">
              <div className="text-center">
                <div className="text-8xl mb-6 opacity-70">🌤️</div>
                <h2 className="text-2xl font-light mb-4 drop-shadow-lg">
                  Search for weather information
                </h2>
                <p className="text-black/70 dark:text-white/80 drop-shadow">
                  Enter a city name to get current conditions and forecast
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

