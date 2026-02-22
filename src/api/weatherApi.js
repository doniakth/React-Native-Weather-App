import axios from 'axios';

// WeatherAPI.com configuration (used for current weather + geocoding)
const API_KEY = '1d588f373d2543288b1194204261002';
const BASE_URL = 'https://api.weatherapi.com/v1';

const weatherApi = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

// Open-Meteo API (free, no key needed, supports up to 16 days)
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// WMO Weather interpretation codes → readable description
const WMO_DESCRIPTIONS = {
  0: 'Clear Sky',
  1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy Fog',
  51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
  85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ Hail', 99: 'Thunderstorm w/ Heavy Hail',
};

// Transform WeatherAPI.com current weather response
const transformCurrentWeather = (data) => {
  return {
    coord: {
      lon: data.location.lon,
      lat: data.location.lat,
    },
    weather: [
      {
        id: data.current.condition.code,
        main: data.current.condition.text,
        description: data.current.condition.text.toLowerCase(),
        icon: data.current.condition.icon.split('/').pop().replace('.png', ''),
      },
    ],
    main: {
      temp: data.current.temp_c,
      feels_like: data.current.feelslike_c,
      pressure: data.current.pressure_mb,
      humidity: data.current.humidity,
    },
    wind: {
      speed: data.current.wind_kph / 3.6,
      deg: data.current.wind_degree,
    },
    clouds: {
      all: data.current.cloud,
    },
    dt: data.current.last_updated_epoch,
    sys: {
      country: data.location.country,
    },
    name: data.location.name,
    // Keep lat/lon for forecast geocoding
    _lat: data.location.lat,
    _lon: data.location.lon,
  };
};

// Fetch extended forecast (5 or 7 days) from Open-Meteo using lat/lon
const fetchForecastOpenMeteo = async (lat, lon, days) => {
  const response = await axios.get(OPEN_METEO_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'weathercode',
        'windspeed_10m_max',
        'precipitation_sum',
      ].join(','),
      timezone: 'auto',
      forecast_days: days,
    },
  });

  const daily = response.data.daily;

  // Build a list in the same shape the app already expects
  const forecastList = daily.time.map((dateStr, i) => {
    const dateMs = new Date(dateStr).getTime() / 1000; // epoch seconds
    const code = daily.weathercode[i];
    const description = WMO_DESCRIPTIONS[code] || 'Unknown';

    return {
      dt: dateMs,
      main: {
        temp: (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2,
        temp_max: daily.temperature_2m_max[i],
        temp_min: daily.temperature_2m_min[i],
        humidity: 0, // Open-Meteo free daily doesn't include humidity
        pressure: 1013,
        feels_like: daily.temperature_2m_max[i],
      },
      weather: [
        {
          id: code,
          main: description,
          description: description.toLowerCase(),
          icon: '',
        },
      ],
      wind: {
        speed: (daily.windspeed_10m_max[i] || 0) / 3.6, // kph → m/s
        deg: 0,
      },
      clouds: { all: 0 },
      dt_txt: dateStr,
    };
  });

  return { list: forecastList };
};

// ---------- Public API ----------

export const fetchCurrentWeather = async (city) => {
  try {
    console.log('Fetching current weather for:', city);
    const response = await weatherApi.get('/current.json', {
      params: {
        q: city,
        aqi: 'no',
      },
    });
    const transformed = transformCurrentWeather(response.data);
    console.log('Current weather fetched successfully');
    return transformed;
  } catch (error) {
    console.error('API Error fetching current weather:', error.message);
    throw error;
  }
};

export const fetchForecast = async (city, days = 3) => {
  try {
    console.log(`Fetching ${days}-day forecast for:`, city);

    // Step 1: resolve city → coordinates via WeatherAPI current endpoint
    const geoResponse = await weatherApi.get('/current.json', {
      params: { q: city, aqi: 'no' },
    });
    const { lat, lon } = geoResponse.data.location;

    // Step 2: fetch forecast from Open-Meteo (no day cap)
    const forecast = await fetchForecastOpenMeteo(lat, lon, days);
    console.log(`${days}-day forecast fetched successfully`);
    return forecast;
  } catch (error) {
    console.error('API Error fetching forecast:', error.message);
    throw error;
  }
};

export const fetchCitySuggestions = async (query) => {
  try {
    const response = await weatherApi.get('/search.json', {
      params: { q: query },
    });
    return response.data.map(item => `${item.name}, ${item.country}`);
  } catch (error) {
    console.error('Suggestions error:', error.message);
    return [];
  }
};

export default weatherApi;
