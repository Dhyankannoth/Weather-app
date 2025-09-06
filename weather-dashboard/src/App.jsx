import { useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import DarkBg from "./assets/back pic 7.jpg";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

const DarkAuroraBackground = ({ image }) => {
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
   
      <img src={image} alt="Background" className="w-full h-full object-cover" />

      <div className="pointer-events-none absolute -left-1/4 -top-1/3 w-[70vw] h-[70vh] aurora-glow aurora-a" />
      <div className="pointer-events-none absolute right-[-15%] top-[-10%] w-[55vw] h-[55vh] aurora-glow aurora-b" />
      <div className="pointer-events-none absolute left-[15%] bottom-[-25%] w-[60vw] h-[60vh] aurora-glow aurora-c" />

      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white opacity-80"
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
function WeatherMap({ weather, forecast }) {
  if (!weather) return null;
  const center = [weather.coord.lat, weather.coord.lon];

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "400px", width: "100%", borderRadius: "1rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <Marker position={center}>
        <Popup>
          <strong>{weather.name}</strong> <br />
          Temp: {Math.round(weather.main.temp)}°C <br />
          {weather.weather?.[0]?.description}
        </Popup>
      </Marker>

      {forecast.map((f, i) => (
        <Marker key={i} position={[f.coord.lat, f.coord.lon]}>
          <Popup>
            {getDayName(f.dt_txt)} <br />
            Temp: {Math.round(f.main.temp)}°C <br />
            {f.weather?.[0]?.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

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

      const dailyForecast = forecastData.list
        .filter((f) => f.dt_txt.includes("12:00:00"))
        .slice(0, 5)
        .map((f) => ({
          ...f,
          coord: { lat: data.coord.lat, lon: data.coord.lon },
        }));

      setForecast(dailyForecast);

      let newAlerts = [];
      if (forecastData.list.some((d) => d.weather?.[0]?.description?.includes("rain")))
        newAlerts.push("Carry umbrella 🌧");
      if (forecastData.list.some((d) => d.main?.temp > 35)) newAlerts.push("Stay hydrated 🥵");
      if (data.wind?.speed > 13.8) newAlerts.push("High winds warning 🌪");
      setAlerts(newAlerts);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") getWeather();
  };

  return (
    <div className="dark">
      <div className="min-h-screen relative text-white">
        
        <DarkAuroraBackground image={DarkBg} />

        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-light">Weather Dashboard</h1>
            <div className="relative">
              <input
                className="bg-black/40 border border-gray-400/50 text-white placeholder-gray-400 px-4 py-2 rounded-full w-64 text-sm focus:outline-none shadow-sm"
                placeholder="Search city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className="absolute right-1 top-1 bg-gray-700/30 hover:bg-gray-600/50 text-white p-1.5 rounded-full"
                onClick={getWeather}
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {weather ? (
            <div className="grid grid-cols-12 gap-6">
              
              <div className="col-span-12 lg:col-span-8">
                <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-lg">
                  {weather?.main && (
                    <div className="flex items-center space-x-6">
                      {getWeatherIcon(weather?.weather?.[0]?.description || "", true)}
                      <div>
                        <h2 className="text-4xl font-light">
                          {Math.round(weather?.main?.temp)}°C
                        </h2>
                        <p className="text-gray-300 capitalize">
                          {weather?.weather?.[0]?.description}
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="mt-4 text-gray-400">Location: {weather?.name}</p>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                {alerts.length > 0 && (
                  <div className="bg-orange-900/20 rounded-2xl p-6 border border-orange-700/30 shadow">
                    <h3 className="text-orange-300 text-sm font-medium mb-4 uppercase tracking-wide">
                      Weather Alerts
                    </h3>
                    <div className="space-y-3">
                      {alerts.map((alert, i) => (
                        <div
                          key={i}
                          className="text-orange-100 text-sm bg-orange-500/10 rounded-lg p-3"
                        >
                          {alert}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {weather?.main && (
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/10 shadow">
                    <p>Humidity: {weather?.main?.humidity}%</p>
                    <p>Wind Speed: {weather?.wind?.speed} m/s</p>
                  </div>
                )}
              </div>

              <div className="col-span-12">
                <div className="bg-black/30 rounded-2xl p-6 border border-white/10 shadow">
                  <h3 className="mb-4 text-lg">5-Day Forecast</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {forecast?.length > 0 &&
                      forecast.map((d, i) => (
                        <div
                          key={i}
                          className="bg-black/40 rounded-xl p-4 text-center shadow"
                        >
                          {getWeatherIcon(d.weather?.[0]?.description)}
                          <p className="text-sm">{getDayName(d.dt_txt)}</p>
                          <p>{Math.round(d.main?.temp)}°C</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="col-span-12 mt-6">
                <WeatherMap weather={weather} forecast={forecast} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="text-8xl mb-6 opacity-70">🌤️</div>
                <h2 className="text-2xl font-light mb-4">
                  Search for weather information
                </h2>
                <p className="text-white/80">
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
