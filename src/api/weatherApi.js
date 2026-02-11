import axios from 'axios';

// WeatherAPI.com configuration
const API_KEY = '1d588f373d2543288b1194204261002';
const BASE_URL = 'https://api.weatherapi.com/v1';

const weatherApi = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

// Transform WeatherAPI.com current weather to OpenWeatherMap format
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
      speed: data.current.wind_kph / 3.6, // Convert kph to m/s
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
  };
};

// Transform WeatherAPI.com forecast to OpenWeatherMap format
const transformForecast = (data) => {
  const forecastList = [];

  // WeatherAPI.com provides hourly forecast for 3 days
  data.forecast.forecastday.forEach((day) => {
    day.hour.forEach((hour, index) => {
      // Take every 3rd hour to simulate 3-hour intervals (like OpenWeatherMap)
      if (index % 3 === 0) {
        forecastList.push({
          dt: hour.time_epoch,
          main: {
            temp: hour.temp_c,
            feels_like: hour.feelslike_c,
            pressure: hour.pressure_mb,
            humidity: hour.humidity,
            temp_min: day.day.mintemp_c,
            temp_max: day.day.maxtemp_c,
          },
          weather: [
            {
              id: hour.condition.code,
              main: hour.condition.text,
              description: hour.condition.text.toLowerCase(),
              icon: hour.condition.icon.split('/').pop().replace('.png', ''),
            },
          ],
          clouds: {
            all: hour.cloud,
          },
          wind: {
            speed: hour.wind_kph / 3.6, // Convert kph to m/s
            deg: hour.wind_degree,
          },
          dt_txt: hour.time,
        });
      }
    });
  });

  return {
    list: forecastList,
    city: {
      name: data.location.name,
      country: data.location.country,
      coord: {
        lat: data.location.lat,
        lon: data.location.lon,
      },
    },
  };
};

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
    console.log('Fetching forecast for:', city);
    const response = await weatherApi.get('/forecast.json', {
      params: {
        q: city,
        days: Math.min(days, 3), // Free tier supports up to 3 days
        aqi: 'no',
      },
    });
    const transformed = transformForecast(response.data);
    console.log('Forecast fetched successfully');
    return transformed;
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
