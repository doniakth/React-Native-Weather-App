import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCurrentWeather, fetchForecast, fetchCitySuggestions } from '../../api/weatherApi';

export const getWeather = createAsyncThunk(
    'weather/getWeather',
    async ({ city, days }, { rejectWithValue }) => {
        try {
            const current = await fetchCurrentWeather(city);
            const forecast = await fetchForecast(city, days);
            return { current, forecast };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch weather');
        }
    }
);

export const getSuggestions = createAsyncThunk(
    'weather/getSuggestions',
    async (query, { rejectWithValue }) => {
        try {
            return await fetchCitySuggestions(query);
        } catch (error) {
            return rejectWithValue('Failed to fetch suggestions');
        }
    }
);

const weatherSlice = createSlice({
    name: 'weather',
    initialState: {
        current: null,
        forecast: null,
        loading: false,
        error: null,
        city: 'New Delhi',
        forecastDays: 3,
        suggestions: [],
    },
    reducers: {
        setCity: (state, action) => {
            state.city = action.payload;
        },
        setForecastDays: (state, action) => {
            state.forecastDays = action.payload;
        },
        clearSuggestions: (state) => {
            state.suggestions = [];
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getWeather.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getWeather.fulfilled, (state, action) => {
                state.loading = false;
                state.current = action.payload.current;
                state.forecast = action.payload.forecast;
            })
            .addCase(getWeather.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getSuggestions.fulfilled, (state, action) => {
                state.suggestions = action.payload;
            });
    },
});

export const { setCity, setForecastDays, clearSuggestions, clearError } = weatherSlice.actions;
export default weatherSlice.reducer;
