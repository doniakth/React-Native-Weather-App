import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState: {
        cities: [], // Array of city names (strings)
    },
    reducers: {
        toggleFavorite: (state, action) => {
            const city = action.payload;
            const index = state.cities.findIndex(c => c.toLowerCase() === city.toLowerCase());
            if (index >= 0) {
                state.cities.splice(index, 1);
            } else {
                state.cities.push(city);
            }
        },
        removeFavorite: (state, action) => {
            const city = action.payload;
            state.cities = state.cities.filter(c => c.toLowerCase() !== city.toLowerCase());
        },
    },
});

export const { toggleFavorite, removeFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
