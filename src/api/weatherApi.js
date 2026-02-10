import axios from 'axios';
import { mockCurrentWeather, mockForecast } from '../utils/mockData';

const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const weatherApi = axios.create({
  baseURL: BASE_URL,
  params: {
    appid: API_KEY,
    units: 'metric',
  },
});

const USE_MOCK = API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY' || !API_KEY;

export const fetchCurrentWeather = async (city) => {
  if (USE_MOCK) {
    console.log('Using mock data for current weather');
    return new Promise((resolve) => setTimeout(() => resolve(mockCurrentWeather), 500));
  }
  try {
    const response = await weatherApi.get('/weather', {
      params: { q: city },
    });
    return response.data;
  } catch (error) {
    console.error('API Error, falling back to mock:', error);
    return mockCurrentWeather;
  }
};

export const fetchForecast = async (city, cnt = 7) => {
  if (USE_MOCK) {
    console.log('Using mock data for forecast');
    return new Promise((resolve) => setTimeout(() => resolve(mockForecast), 500));
  }
  try {
    const response = await weatherApi.get('/forecast', {
      params: { q: city },
    });
    return response.data;
  } catch (error) {
    console.error('API Error, falling back to mock:', error);
    return mockForecast;
  }
};

export const fetchCitySuggestions = async (query) => {
  if (USE_MOCK) {
    return ['Mumbai', 'London', 'New York', 'Tokyo', 'Paris'].filter(c => c.toLowerCase().includes(query.toLowerCase()));
  }
  try {
    const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q: query,
        limit: 5,
        appid: API_KEY,
      },
    });
    return response.data.map(item => `${item.name}, ${item.country}`);
  } catch (error) {
    console.error('Suggestions error:', error);
    return [];
  }
};

export default weatherApi;
