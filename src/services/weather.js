// Weather service using Open-Meteo (free, no API key)
const axios = require('axios');

const CITIES = {
  lagos: { lat: 6.5244, lon: 3.3792, name: 'Lagos' },
  abuja: { lat: 9.0579, lon: 7.4951, name: 'Abuja' },
  kano: { lat: 12.0022, lon: 8.5920, name: 'Kano' },
  ibadan: { lat: 7.3775, lon: 3.9470, name: 'Ibadan' },
  ph: { lat: 4.8156, lon: 7.0498, name: 'Port Harcourt' },
  'port harcourt': { lat: 4.8156, lon: 7.0498, name: 'Port Harcourt' },
  enugu: { lat: 6.4584, lon: 7.5464, name: 'Enugu' },
  kaduna: { lat: 10.5222, lon: 7.4383, name: 'Kaduna' },
};

const WMO_CODES = {
  0: 'Clear sky ☀️', 1: 'Mainly clear 🌤️', 2: 'Partly cloudy ⛅', 3: 'Overcast ☁️',
  45: 'Foggy 🌫️', 48: 'Icy fog 🌫️', 51: 'Light drizzle 🌦️', 53: 'Drizzle 🌦️',
  55: 'Heavy drizzle 🌧️', 61: 'Light rain 🌧️', 63: 'Rain 🌧️', 65: 'Heavy rain 🌧️',
  80: 'Rain showers 🌦️', 81: 'Heavy showers 🌧️', 82: 'Violent showers ⛈️',
  95: 'Thunderstorm ⛈️', 96: 'Thunderstorm + hail ⛈️', 99: 'Heavy thunderstorm ⛈️'
};

async function getWeather(cityInput) {
  const key = (cityInput || 'lagos').toLowerCase().trim();
  const city = CITIES[key] || CITIES.lagos;
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Africa%2FLagos&forecast_days=3`;
    const r = await axios.get(url, { timeout: 8000 });
    const c = r.data.current;
    const d = r.data.daily;

    const cond = WMO_CODES[c.weather_code] || 'Unknown';
    let msg = `🌤️ *${city.name} Weather*\n\n`;
    msg += `Now: ${cond}\n`;
    msg += `🌡️ Temp: ${c.temperature_2m}°C (feels like ${c.apparent_temperature}°C)\n`;
    msg += `💧 Humidity: ${c.relative_humidity_2m}%\n`;
    msg += `💨 Wind: ${c.wind_speed_10m} km/h\n\n`;
    msg += `*3-Day Forecast*\n`;
    for (let i = 0; i < 3; i++) {
      const date = new Date(d.time[i]).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
      const cond2 = WMO_CODES[d.weather_code[i]] || 'N/A';
      msg += `${date}: ${cond2} ${d.temperature_2m_min[i]}° – ${d.temperature_2m_max[i]}°C\n`;
    }
    return msg;
  } catch (e) {
    return `❌ Weather error: ${e.message}\nTry: /weather lagos | abuja | kano | ph`;
  }
}

module.exports = { getWeather, CITIES };
